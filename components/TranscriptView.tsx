import React, { useState, useEffect } from 'react';
import { TranscriptionState } from '../types';
import { UI_MESSAGES, SUPPORTED_LANGUAGES } from '../constants';

interface TranscriptViewProps {
  state: TranscriptionState;
  onTranslate: (lang: string) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ state, onTranslate }) => {
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0].name); // Store name or code? Let's store name for UI, logic needs code. 
  // Wait, let's store code.
  const [selectedLangCode, setSelectedLangCode] = useState(SUPPORTED_LANGUAGES[0].code);
  
  const [viewMode, setViewMode] = useState<'original' | 'translated'>('original');

  const hasTranslation = !!state.translation;
  const isTranslating = state.translation?.status === 'translating';

  // Auto switch to translated view when translation completes
  useEffect(() => {
    if (state.translation?.status === 'completed') {
      setViewMode('translated');
    }
  }, [state.translation?.status]);

  const activeText = viewMode === 'translated' && state.translation?.text 
    ? state.translation.text 
    : state.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([activeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = viewMode === 'translated' ? `translation_${selectedLangCode}.txt` : "transcription.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (state.status === 'idle' || state.status === 'reading') {
    return null;
  }

  const showTranslationControls = state.status === 'completed' || state.status === 'transcribing' && state.text.length > 0; // Or just if text exists

  return (
    <div className="w-full bg-slate-900 rounded-3xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-[600px]">
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className={`w-2.5 h-2.5 rounded-full ${state.status === 'transcribing' ? 'bg-violet-500 animate-pulse' : state.status === 'error' ? 'bg-red-500' : 'bg-emerald-400'}`} />
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            {state.status === 'transcribing' ? 'Transcribing...' : state.status === 'error' ? 'Error' : UI_MESSAGES.success}
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Translation Controls */}
          {showTranslationControls && state.text && (
            <div className="flex items-center space-x-2 mr-2 bg-slate-800/50 p-1 rounded-lg">
              <select 
                value={selectedLangCode}
                onChange={(e) => setSelectedLangCode(e.target.value)}
                disabled={isTranslating}
                className="bg-transparent text-sm font-medium text-slate-300 focus:outline-none border-none cursor-pointer py-1 pl-2 pr-1"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onTranslate(selectedLangCode)}
                disabled={isTranslating}
                className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isTranslating ? (
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                Translate
              </button>
            </div>
          )}

          <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>

          {/* Action Buttons */}
          <div className="flex space-x-1">
             <button 
              onClick={handleCopy}
              disabled={!activeText}
              className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors disabled:opacity-50"
              title="Copy to clipboard"
            >
              {copied ? (
                 <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 0h6" />
                </svg>
              )}
            </button>
            <button 
              onClick={handleDownload}
              disabled={!activeText}
              className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors disabled:opacity-50"
              title="Download .txt"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (Only visible if translation exists) */}
      {(hasTranslation || isTranslating) && (
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/30">
          <button
            onClick={() => setViewMode('original')}
            className={`mr-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              viewMode === 'original' 
              ? 'border-violet-500 text-violet-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode('translated')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors ${
              viewMode === 'translated' 
              ? 'border-violet-500 text-violet-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Translated
             {isTranslating && (
              <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
             )}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-900/50">
        {state.error ? (
           <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
             <div className="w-16 h-16 mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <p className="max-w-md font-medium text-lg mb-1">{UI_MESSAGES.error}</p>
             <p className="text-sm text-red-400/60">{state.error}</p>
           </div>
        ) : (
          <>
            {/* View Mode Logic */}
            {viewMode === 'original' ? (
              state.text ? (
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 max-w-none whitespace-pre-wrap leading-relaxed">
                  {state.text}
                  {state.status === 'transcribing' && (
                    <span className="inline-block w-2 h-4 ml-1 align-middle bg-violet-500 animate-pulse"></span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v-11m0 0l-4 4m4-4l4 4" />
                  </svg>
                  <p className="font-medium">Ready to transcribe</p>
                </div>
              )
            ) : (
              // Translated View
               <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 max-w-none whitespace-pre-wrap leading-relaxed">
                 {state.translation?.error ? (
                    <p className="text-red-400 text-sm italic">Translation failed: {state.translation.error}</p>
                 ) : state.translation?.text ? (
                    state.translation.text
                 ) : isTranslating ? (
                    <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-violet-500 rounded-full delay-75"></div>
                      <div className="w-2 h-2 bg-violet-500 rounded-full delay-150"></div>
                      <span className="text-sm">Translating...</span>
                    </div>
                 ) : (
                    <p className="text-slate-600 italic">Select a language and click Translate.</p>
                 )}
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
