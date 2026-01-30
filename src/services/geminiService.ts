import { GoogleGenAI } from "@google/genai";
import { fileToBase64, getMimeType } from "@/utils/fileHelpers";

const SYSTEM_INSTRUCTION = `You are a bilingual speech-to-text assistant.

When the user uploads an audio or video file, transcribe all spoken content accurately from start to end.

Rules:
Transcribe everything that is spoken
Do not summarize
Do not skip unclear speech
Do not stop early
Preserve original word order

Bilingual behavior:
Automatically detect all spoken languages
Support two languages in the same audio
Allow language switching mid-sentence
Transcribe each segment in its original language
Do not translate unless the user explicitly asks

Formatting:
Use proper punctuation
Break text into readable paragraphs
Add speaker labels only if clearly detectable
No explanations or commentary in the output

Output:
Return only the full transcript text

Priority:
Accuracy and completeness are more important than creativity.`;

// 20MB Threshold for inline vs upload
const INLINE_DATA_THRESHOLD = 20 * 1024 * 1024; 

export const transcribeMedia = async (file: File, onStatusUpdate?: (msg: string) => void): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables. Please set API_KEY.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-pro-preview'; 

  try {
    let contentPart: any;
    
    const mimeType = getMimeType(file);
    console.log(`Processing file: ${file.name}, Size: ${file.size}, Detected Mime: ${mimeType}`);

    if (file.size < INLINE_DATA_THRESHOLD) {
      onStatusUpdate?.("Processing file...");
      const base64Data = await fileToBase64(file);
      const base64Content = base64Data.split(',')[1];
      
      contentPart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Content
        }
      };
    } else {
      onStatusUpdate?.("Uploading large file to Gemini (this may take a minute)...");
      try {
        const fileUri = await uploadFileToGemini(file, process.env.API_KEY, mimeType, onStatusUpdate);
        contentPart = {
            fileData: {
            mimeType: mimeType,
            fileUri: fileUri
            }
        };
      } catch (uploadError: any) {
         if (uploadError.message && (uploadError.message.includes('INVALID_ARGUMENT') || uploadError.message.includes('400'))) {
             throw new Error(`The file format for "${file.name}" is not supported by the upload API (MIME: ${mimeType}). Please try converting it to a standard MP4 or WAV file.`);
         }
         throw uploadError;
      }
    }

    onStatusUpdate?.("Generating transcript...");
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          contentPart,
          {
            text: "Transcribe the attached media file accurately following the system instructions."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, 
      }
    });

    if (!response.text) {
      throw new Error("No transcription text returned from the model.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('413')) {
       throw new Error("File upload failed. The file might be too large even for the upload API, or the connection was interrupted.");
    }
    throw error;
  }
};

async function uploadFileToGemini(
  file: File, 
  apiKey: string, 
  mimeType: string,
  onStatusUpdate?: (msg: string) => void
): Promise<string> {
  const displayName = file.name.replace(/[^\w.-]/g, '_');
  const metaData = { file: { display_name: displayName } };

  // 1. Start Resumable Upload
  const startUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
  
  const startResponse = await fetch(startUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': file.size.toString(),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metaData),
  });

  if (!startResponse.ok) {
    const errText = await startResponse.text();
    console.error("Upload start failed:", startResponse.status, errText);
    throw new Error(`Failed to initiate upload: ${startResponse.status} ${startResponse.statusText}`);
  }

  const uploadUrl = startResponse.headers.get('x-goog-upload-url');
  if (!uploadUrl) {
    throw new Error("Failed to get upload URL from Gemini API");
  }

  // 2. Upload Content
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': mimeType, 
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload,finalize',
    },
    body: file 
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    console.error("Upload content failed:", uploadResponse.status, errText);
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  const fileInfo = await uploadResponse.json();
  const fileUri = fileInfo.file.uri;

  // 3. Poll for state
  let state = fileInfo.file.state;
  const fileName = fileInfo.file.name; 

  while (state === 'PROCESSING') {
    onStatusUpdate?.("Processing file on server...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const checkUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`;
    const checkResp = await fetch(checkUrl);
    const checkData = await checkResp.json();
    
    state = checkData.state;
    if (state === 'FAILED') {
      throw new Error("File processing failed on Gemini servers.");
    }
  }

  return fileUri;
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-flash-preview"; 

  const prompt = `Translate the following text into ${targetLanguage}. 
Ensure the translation is accurate, preserves the original tone, and maintains the formatting.
Text: ${text}`;

  try {
    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
    });
    if (!response.text) throw new Error("No translation returned.");
    return response.text;
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};