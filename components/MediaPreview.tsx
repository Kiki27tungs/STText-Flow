import React, { useMemo } from 'react';
import { FileAudio, FileVideo } from 'lucide-react';
import { formatFileSize } from '../utils/fileHelpers';

interface MediaPreviewProps {
  file: File;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ file }) => {
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);
  
  React.useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const isVideo = file.type.startsWith('video') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 p-5 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 p-4 rounded-2xl flex-shrink-0 shadow-lg shadow-purple-500/20 relative z-10">
          {isVideo ? (
            <FileVideo className="w-8 h-8 text-white" />
          ) : (
            <FileAudio className="w-8 h-8 text-white" />
          )}
        </div>
        <div className="overflow-hidden min-w-0 relative z-10">
          <p className="font-bold text-xl text-gray-900 truncate" title={file.name}>{file.name}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1.5 font-medium">
             <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
               {file.name.split('.').pop()}
             </span>
             <span className="text-gray-300">•</span>
             <span>{formatFileSize(file.size)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/20 ring-4 ring-white/50">
        {isVideo ? (
          <video 
            src={objectUrl} 
            controls 
            className="w-full max-h-[400px] mx-auto block"
          />
        ) : (
          <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
            <audio 
              src={objectUrl} 
              controls 
              className="w-full h-12 [&::-webkit-media-controls-panel]:bg-gray-200 [&::-webkit-media-controls-enclosure]:rounded-xl" 
            />
          </div>
        )}
      </div>
    </div>
  );
};