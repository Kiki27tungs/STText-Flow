import React, { useCallback, useState } from 'react';
import { FileData } from '../types';
import { MAX_FILE_SIZE_BYTES, UI_MESSAGES } from '../constants';

interface FileUploadProps {
  onFileSelect: (data: FileData) => void;
  disabled: boolean;
}

// Helper to determine the most accurate MIME type
const getCorrectMimeType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  // Priority: Check extension first for common audio types that browsers mess up
  switch (extension) {
    case 'm4a': return 'audio/mp4';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'aac': return 'audio/aac';
    case 'flac': return 'audio/flac';
    case 'ogg': return 'audio/ogg';
    case 'opus': return 'audio/opus';
    case 'webm': 
        // Webm can be audio or video. If browser says audio/webm, keep it.
        // If browser says video/webm, keep it.
        // If ambiguous/empty, assume video usually, but for STT maybe audio? 
        // Let's fallback to file.type.
        return file.type || 'video/webm';
    default:
      return file.type || 'application/octet-stream';
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File too big. Limit is 400MB.`);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const [metadata, base64Data] = result.split(',');
      
      // We ignore the MIME type from the FileReader metadata because it's just what the browser thinks.
      // Instead we use our robust helper.
      const mimeType = getCorrectMimeType(file);

      if (base64Data && mimeType) {
         console.log(`Processing file: ${file.name}, Detected MIME: ${mimeType} (Original: ${file.type})`);
         onFileSelect({
          file,
          previewUrl: URL.createObjectURL(file),
          base64Data,
          mimeType
        });
      } else {
        setError("Could not parse file.");
      }
    };

    reader.onerror = () => {
      setError("Error reading file.");
    };

    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full">
      <div
        className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out text-center ${
          dragActive 
            ? 'border-violet-500 bg-violet-500/10' 
            : disabled 
              ? 'border-slate-800 bg-slate-900 cursor-not-allowed opacity-50' 
              : 'border-slate-800 bg-slate-900/50 hover:border-violet-500 hover:bg-slate-900 cursor-pointer'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={!disabled ? handleDrop : undefined}
      >
        <input
          id="file-upload"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          accept="audio/*,video/*"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-800 group-hover:text-violet-400'}`}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v-11m0 0l-4 4m4-4l4 4" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-100 tracking-tight">
              {UI_MESSAGES.uploadHeadline}
            </p>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              {UI_MESSAGES.uploadSubtext}
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center">
           <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}
    </div>
  );
};
