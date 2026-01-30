export interface TranscriptionConfig {
  language?: string;
}

export type SupportedMimeType = 
  | 'audio/mp3'
  | 'audio/mpeg'
  | 'audio/wav' 
  | 'audio/x-m4a'
  | 'audio/m4a'
  | 'audio/mp4'
  | 'video/mp4'
  | 'video/quicktime'; // .mov

export const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.mp4', '.mov'];