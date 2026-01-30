"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Prefer webm/opus, fallback to default
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' }; // Safari 
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        
        // Create a file with an appropriate extension
        const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], `recording.${ext}`, { type: mimeType });
        
        onRecordingComplete(file);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect chunks every second
      setIsRecording(true);
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Microphone permission denied. Please allow access to record audio.");
      } else {
        setError("Could not access microphone. Please ensure your device has a working microphone.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border-[3px] border-dashed border-indigo-200 rounded-[2rem] bg-white/60 p-12 relative overflow-hidden transition-all duration-300">
        {/* Visuals */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-50 -z-10" />

        {error ? (
           <div className="text-center space-y-4">
             <div className="bg-red-100 p-4 rounded-full inline-block text-red-500">
               <AlertCircle className="w-12 h-12" />
             </div>
             <p className="text-red-600 font-medium max-w-xs mx-auto">{error}</p>
             <button 
               onClick={startRecording}
               className="text-indigo-600 font-bold hover:underline"
             >
               Try Again
             </button>
           </div>
        ) : (
          <>
            <div className={`p-8 rounded-full mb-8 transition-all duration-500 shadow-xl relative ${
              isRecording 
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40' 
                : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:scale-105'
            }`}>
                <Mic className="w-12 h-12 relative z-10" />
                {isRecording && (
                  <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75"></span>
                )}
            </div>

            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                {isRecording ? 'Recording...' : 'Record Audio'}
            </h3>
            
            <div className={`text-5xl font-mono font-bold mb-10 tracking-wider tabular-nums ${isRecording ? 'text-rose-600' : 'text-gray-400'}`}>
                {formatTime(duration)}
            </div>

            {!isRecording ? (
                <button 
                    onClick={startRecording}
                    className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                >
                    Start Recording
                </button>
            ) : (
                <button 
                    onClick={stopRecording}
                    className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-rose-500 rounded-xl shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-500/30 gap-2"
                >
                    <Square className="w-5 h-5 fill-current" />
                    Stop Recording
                </button>
            )}
            
            <p className="mt-8 text-gray-500 text-sm font-medium">
                {isRecording ? 'Tap stop when you are finished.' : 'Click start to begin recording from your microphone.'}
            </p>
          </>
        )}
    </div>
  );
};