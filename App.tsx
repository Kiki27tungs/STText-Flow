import React, { useState, useCallback } from 'react';
import { Header } from './src/components/Header';
import { FileUpload } from './src/components/FileUpload';
import { AudioRecorder } from './src/components/AudioRecorder';
import { MediaPreview } from './src/components/MediaPreview';
import { TranscriptDisplay } from './src/components/TranscriptDisplay';
import { transcribeMedia } from './src/services/geminiService';
import { Loader2, AlertCircle, Sparkles, UploadCloud, Mic } from 'lucide-react';

export default function App() {
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
    <div className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 
        ========================================
        Premium Abstract Background Layer
        ========================================
      */}
      
      {/* 1. Base Layer: Warm, high-end off-white */}
      <div className="fixed inset-0 -z-50 bg-[#FAFAFA]" />

      {/* 2. Soft Gradient Orbs: Muted, diffuse, calming colors */}
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
        {/* Top Left: Soft Indigo */}
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] md:w-[800px] md:h-[800px] bg-indigo-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob opacity-70" />
        
        {/* Top Right: Dusty Rose */}
        <div className="absolute top-[-10%] right-[-20%] w-[60vw] h-[60vw] md:w-[600px] md:h-[600px] bg-rose-100/40 rounded-full blur-[80px] mix-blend-multiply animate-blob animation-delay-2000 opacity-60" />
        
        {/* Bottom Left: Pale Sky Blue */}
        <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] md:w-[700px] md:h-[700px] bg-sky-100/50 rounded-full blur-[90px] mix-blend-multiply animate-blob animation-delay-4000 opacity-60" />
        
        {/* Bottom Right: Soft Lavender */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-violet-100/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000 opacity-50" />
      </div>

      {/* 3. Noise Texture: Adds a premium, paper-like grain (opacity 4%) */}
      <div 
        className="fixed inset-0 -z-30 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
        }}
      />

      {/* ======================================== */}

      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="space-y-12">
          
          {/* Hero Section */}
          {!file && (
            <div className="text-center space-y-6 mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-indigo-50 text-indigo-900 text-sm font-semibold shadow-sm backdrop-blur-md mb-4 ring-1 ring-white/50">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Powered by Gemini 3.0 Pro</span>
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800 leading-[1.1]">
                Turn Speech into <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden ring-1 ring-white/60">
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
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                      >
                         <Sparkles className="w-6 h-6 mr-2 text-indigo-200" />
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