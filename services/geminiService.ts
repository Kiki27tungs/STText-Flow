import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { TranscriptionModel } from "../types";

export const transcribeMedia = async (
  base64Data: string,
  mimeType: string,
  onChunk: (text: string) => void,
  modelName: string = TranscriptionModel.QUALITY
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use the stream method to provide feedback during the potentially long process
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Please transcribe the attached media file following the system instructions.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2, // Low temperature for more faithful transcription
      },
    });

    let fullText = "";
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }

    return fullText;
  } catch (error: any) {
    console.error("Gemini Transcription Error:", error);
    throw new Error(error.message || "Failed to transcribe media.");
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text into ${targetLanguage}. Maintain the original formatting, speaker labels (if any), and tone. Return ONLY the translated text.\n\n[TEXT_START]\n${text}\n[TEXT_END]`,
      config: {
        temperature: 0.1,
      }
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Translation Error:", error);
    throw new Error(error.message || "Failed to translate text.");
  }
};
