"use client";

import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { AudioRecorder } from '@/components/AudioRecorder';
import { MediaPreview } from '@/components/MediaPreview';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { transcribeMedia } from '../services/geminiService';
import { Loader2, AlertCircle, Sparkles, UploadCloud, Mic } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setTranscript(null);
    setError(null);
    setStatusMessage("");
  };

  const handleClear = () => {
    setFile(null);
    setTranscript(null);
    setError(null);
    setStatusMessage("");
  };

  const handleTranscribe = useCallback(async () => {
    if (!file) return;

    setIsTranscribing(true);
    setError(null);
    setStatusMessage("Initializing...");

    try {
      const result = await transcribeMedia(file, (msg) => setStatusMessage(msg));
      setTranscript(result);
    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(err.message || "An error occurred during transcription. Please try again.");
    } finally {
      setIsTranscribing(false);
      setStatusMessage("");
    }
  }, [file]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="space-y-12">
          
          {/* Hero Section */}
          {!file && (
            <div className="text-center space-y-6 mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 text-indigo-900 text-sm font-semibold shadow-sm backdrop-blur-md mb-4 ring-1 ring-white/50">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Powered by Gemini 3.0 Pro</span>
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800 leading-[1.1]">
                Turn Speech into <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Text
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                Upload your audio or video. Our AI automatically detects languages 
                and delivers a verbatim bilingual transcript in seconds.
              </p>
            </div>
          )}

          {/* Interaction Area */}
          <div className="transition-all duration-500 ease-in-out transform">
            {!file ? (
               <div className="space-y-8 animate-fade-in-up">
                {/* Input Mode Toggle */}
                <div className="flex justify-center">
                    <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl inline-flex shadow-sm border border-white/40 ring-1 ring-white/60">
                        <button 
                            onClick={() => setInputMode('upload')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === 'upload' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'}`}
                        >
                            <UploadCloud className="w-4 h-4" />
                            Upload File
                        </button>
                        <button 
                            onClick={() => setInputMode('record')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === 'record' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'}`}
                        >
                            <Mic className="w-4 h-4" />
                            Record Audio
                        </button>
                    </div>
                </div>

                {inputMode === 'upload' ? (
                    <FileUpload onFileSelect={handleFileSelect} />
                ) : (
                    <AudioRecorder onRecordingComplete={handleFileSelect} />
                )}
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden ring-1 ring-white/60">
                <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-white/50 to-indigo-50/20">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Ready to Process
                  </h3>
                  <button 
                    onClick={handleClear}
                    className="text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isTranscribing}
                  >
                    Remove & Upload New
                  </button>
                </div>
                
                <div className="p-8 space-y-8">
                  <MediaPreview file={file} />

                  {error && (
                    <div className="bg-rose-50/80 border border-rose-100 text-rose-700 p-5 rounded-2xl flex items-start gap-3 shadow-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                      <p className="font-semibold">{error}</p>
                    </div>
                  )}

                  {!transcript && !isTranscribing && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handleTranscribe}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                      >
                         <Sparkles className="w-6 h-6 mr-2 text-indigo-100" />
                        Start Magic Transcription
                      </button>
                    </div>
                  )}

                  {isTranscribing && (
                    <div className="text-center py-12 space-y-6 bg-gradient-to-b from-transparent to-indigo-50/30 rounded-3xl border border-indigo-50/50">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 blur-3xl opacity-20 animate-pulse rounded-full w-20 h-20 mx-auto"></div>
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto relative z-10" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {statusMessage || "Transcribing Media..."}
                        </h4>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                          Analyzing audio streams and detecting languages. 
                          <br />This may take a moment.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {transcript && (
            <div className="transition-all duration-700 ease-out transform translate-y-0 opacity-100">
               <TranscriptDisplay transcript={transcript} />
            </div>
          )}

        </div>
      </main>

      <footer className="py-8 mt-auto relative z-10">
        <div className="container mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase opacity-80">
                Developed by Kiki Tungoe
            </p>
        </div>
      </footer>
    </div>
  );
}