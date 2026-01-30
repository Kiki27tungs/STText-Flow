"use client";
import React, { useRef, useState } from 'react';
import { UploadCloud, Music, Film } from 'lucide-react';
import { SUPPORTED_EXTENSIONS } from '@/types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
      onFileSelect(file);
    } else {
      alert(`Unsupported file type. Please upload one of: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    }
  };

  return (
    <div 
      className={`group relative border-[3px] border-dashed rounded-[2rem] p-12 transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[400px] cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-fuchsia-500 bg-fuchsia-50/80 scale-[1.02] shadow-2xl shadow-fuchsia-200' 
          : 'border-indigo-200 bg-white/60 hover:border-violet-400 hover:bg-white hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-200/50'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        accept={SUPPORTED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
      />
      
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <div className={`p-6 rounded-3xl mb-8 transition-all duration-300 shadow-sm ${
        isDragging 
          ? 'bg-fuchsia-100 text-fuchsia-600 scale-110 rotate-3' 
          : 'bg-indigo-50 text-indigo-500 group-hover:bg-gradient-to-br group-hover:from-fuchsia-500 group-hover:to-purple-600 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-lg group-hover:shadow-purple-500/30'
      }`}>
        <UploadCloud className="w-16 h-16" />
      </div>
      
      <h3 className="text-3xl font-extrabold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-fuchsia-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
        Drop media here
      </h3>
      
      <p className="text-gray-500 text-center max-w-sm mb-10 text-lg font-medium leading-relaxed group-hover:text-gray-600">
        Click to browse or drag & drop.
        <br />
        <span className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full mt-3 inline-block text-gray-400 font-semibold group-hover:border-purple-200 group-hover:text-purple-400 shadow-sm">
          MP3, WAV, M4A, MP4, MOV
        </span>
      </p>

      <div className="flex items-center gap-10 border-t border-gray-200/60 pt-8 w-full max-w-sm justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-fuchsia-500 transition-colors">
          <div className="p-2 rounded-full bg-gray-50 group-hover:bg-fuchsia-50 transition-colors">
             <Music className="w-6 h-6" /> 
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Audio</span>
        </div>
        <div className="w-px h-10 bg-gray-200 group-hover:bg-purple-200 transition-colors"></div>
        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-cyan-500 transition-colors">
          <div className="p-2 rounded-full bg-gray-50 group-hover:bg-cyan-50 transition-colors">
            <Film className="w-6 h-6" /> 
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Video</span>
        </div>
      </div>
    </div>
  );
};