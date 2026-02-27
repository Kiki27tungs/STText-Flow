export interface TranscriptionState {
  status: 'idle' | 'reading' | 'uploading' | 'transcribing' | 'completed' | 'error';
  text: string;
  error?: string;
  translation?: {
    status: 'idle' | 'translating' | 'completed' | 'error';
    targetLanguage: string;
    text: string;
    error?: string;
  };
}

export interface FileData {
  file: File;
  previewUrl?: string;
  base64Data?: string;
  mimeType?: string;
}

export enum TranscriptionModel {
  FAST = 'gemini-3-flash-preview',
  QUALITY = 'gemini-3-pro-preview'
}
