import { GoogleGenAI } from "@google/genai";

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

export const transcribeMedia = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-3-pro-preview for best multimodal reasoning and long context
  const modelId = 'gemini-3-pro-preview'; 

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Transcribe the attached media file accurately following the system instructions."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual transcription
      }
    });

    if (!response.text) {
      throw new Error("No transcription text returned from the model.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('413')) {
       throw new Error("The file is too large for the current demo environment. Please try a shorter clip (under 20MB).");
    }
    
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use Flash for fast text-to-text tasks
  const modelId = "gemini-3-flash-preview"; 

  const prompt = `Translate the following text into ${targetLanguage}. 
Ensure the translation is accurate, preserves the original tone, and maintains the formatting (paragraphs, speaker labels if any).
Do not add any introductory or concluding remarks, just provide the translated text.

Text to translate:
${text}`;

  try {
    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
    });
    
    if (!response.text) {
        throw new Error("No translation returned.");
    }

    return response.text;
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};