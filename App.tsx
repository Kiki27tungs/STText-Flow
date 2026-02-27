import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { TranscriptView } from './components/TranscriptView';
import { FileData, TranscriptionState, TranscriptionModel } from './types';
import { transcribeMedia, translateText } from './services/geminiService';
import { WARNING_FILE_SIZE_BYTES, UI_MESSAGES } from './constants';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    status: 'idle',
    text: '',
  });
  const [model, setModel] = useState<TranscriptionModel>(TranscriptionModel.QUALITY);
  const [loadingText, setLoadingText] = useState(UI_MESSAGES.loading[0]);
  
  // Ref to track if unmounted
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  // Rotating loading text effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (transcriptionState.status === 'transcribing') {
      let index = 0;
      setLoadingText(UI_MESSAGES.loading[0]);
      interval = setInterval(() => {
        index = (index + 1) % UI_MESSAGES.loading.length;
        setLoadingText(UI_MESSAGES.loading[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [transcriptionState.status]);

  const handleFileSelect = (data: FileData) => {
    setFileData(data);
    setTranscriptionState({ status: 'idle', text: '' });
  };

  const handleReset = () => {
    setFileData(null);
    setTranscriptionState({ status: 'idle', text: '' });
  };

  const startTranscription = async () => {
    if (!fileData || !fileData.base64Data || !fileData.mimeType) return;

    setTranscriptionState({ status: 'transcribing', text: '' });

    try {
      await transcribeMedia(
        fileData.base64Data,
        fileData.mimeType,
        (partialText) => {
          if (isMounted.current) {
            setTranscriptionState(prev => ({ ...prev, text: partialText }));
          }
        },
        model
      );
      
      if (isMounted.current) {
        setTranscriptionState(prev => ({ ...prev, status: 'completed' }));
      }
    } catch (error: any) {
      if (isMounted.current) {
        setTranscriptionState(prev => ({ 
          ...prev, 
          status: 'error', 
          error: error.message || 'An unknown error occurred' 
        }));
      }
    }
  };

  const handleTranslate = async (targetLang: string) => {
    if (!transcriptionState.text) return;

    setTranscriptionState(prev => ({
      ...prev,
      translation: {
        status: 'translating',
        targetLanguage: targetLang,
        text: prev.translation?.text || '' 
      }
    }));

    try {
      const translated = await translateText(transcriptionState.text, targetLang);
       if (isMounted.current) {
        setTranscriptionState(prev => ({
          ...prev,
          translation: {
            status: 'completed',
            targetLanguage: targetLang,
            text: translated
          }
        }));
      }
    } catch (err: any) {
      if (isMounted.current) {
         setTranscriptionState(prev => ({
          ...prev,
          translation: {
            status: 'error',
            targetLanguage: targetLang,
            text: '',
            error: err.message
          }
        }));
      }
    }
  };

  const isTranscribing = transcriptionState.status === 'transcribing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-12 font-sans selection:bg-violet-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              STText-<span className="text-violet-500">Flow</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">
              Speech-to-Text. <span className="text-slate-200">Simplified.</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
             <button
              onClick={() => setModel(TranscriptionModel.FAST)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                model === TranscriptionModel.FAST 
                ? 'bg-slate-800 text-violet-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Flash ⚡
            </button>
            <button
              onClick={() => setModel(TranscriptionModel.QUALITY)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                model === TranscriptionModel.QUALITY 
                ? 'bg-slate-800 text-violet-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Pro ✨
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-200">Media Input</h3>
                {fileData && (
                  <button 
                    onClick={handleReset}
                    disabled={isTranscribing}
                    className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wide disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {!fileData ? (
                <FileUpload onFileSelect={handleFileSelect} disabled={isTranscribing} />
              ) : (
                <div className="space-y-6">
                  {/* File Preview Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                    <div className="aspect-video bg-black flex items-center justify-center">
                      {fileData.mimeType?.startsWith('video/') ? (
                         <video 
                           src={fileData.previewUrl} 
                           controls 
                           className="w-full h-full object-contain" 
                         />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <span className="text-sm font-bold tracking-wide">AUDIO FILE</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                      <p className="font-semibold text-slate-200 truncate">{fileData.file.name}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-medium">
                        {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB • {fileData.mimeType}
                      </p>
                      {fileData.file.size > WARNING_FILE_SIZE_BYTES && (
                        <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-medium">
                          ⚠️ Heavy file. Browser might sweat a bit.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={startTranscription}
                    disabled={isTranscribing}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-3 ${
                      isTranscribing 
                        ? 'bg-slate-800 cursor-not-allowed text-slate-400' 
                        : 'bg-violet-600 hover:bg-violet-500 hover:shadow-violet-500/25'
                    }`}
                  >
                    {isTranscribing ? (
                      <>
                        <svg className="animate-spin -ml-1 h-5 w-5 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="animate-pulse">{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <span>Start Transcription</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-violet-900/50 to-slate-900 rounded-3xl p-8 border border-violet-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-all duration-700"></div>
              <h3 className="font-bold text-lg mb-3 relative z-10 text-white">The Vibe Check</h3>
              <ul className="text-slate-300 text-sm space-y-2.5 relative z-10 font-medium">
                <li className="flex items-start">
                  <span className="mr-2 text-violet-400">✨</span> Best for clear audio & distinct voices.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-violet-400">🗣️</span> We speak two languages at once.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-violet-400">⏳</span> Takes ~15% of total audio time.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-violet-400">🚫</span> Don't close this tab. Seriously.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            <TranscriptView 
              state={transcriptionState} 
              onTranslate={handleTranslate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
