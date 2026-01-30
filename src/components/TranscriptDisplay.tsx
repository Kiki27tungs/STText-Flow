"use client";
import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Globe, Loader2 } from 'lucide-react';
import { translateText } from '@/services/geminiService';

interface TranscriptDisplayProps {
  transcript: string;
}

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'spanish', label: 'Spanish' },
  { id: 'french', label: 'French' },
  { id: 'german', label: 'German' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'chinese', label: 'Chinese' },
];

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const handleCopy = async () => {
    const textToCopy = activeTab === 'original' ? transcript : (translations[activeTab] || '');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'original' ? transcript : (translations[activeTab] || '');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${activeTab}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLanguageChange = async (langId: string, langLabel: string) => {
    setActiveTab(langId);
    
    if (langId !== 'original' && !translations[langId]) {
        setIsTranslating(true);
        try {
            const result = await translateText(transcript, langLabel);
            setTranslations(prev => ({...prev, [langId]: result}));
        } catch (err) {
            console.error("Translation failed", err);
        } finally {
            setIsTranslating(false);
        }
    }
  };

  const currentText = activeTab === 'original' ? transcript : (translations[activeTab] || '');

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo-200/50 border-0 overflow-hidden ring-1 ring-black/5 animate-fade-in-up relative flex flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500"></div>

      <div className="px-8 py-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white/80 sticky top-0 z-30 backdrop-blur-xl gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
                <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-xl tracking-tight">
            Transcription Result
            </h3>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100"
            title="Download as .txt"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all border shadow-sm ${
              copied 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-gray-900 text-white hover:bg-gray-800 border-transparent hover:shadow-lg'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-50/80 px-8 py-4 border-b border-gray-200/50 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Translate to:
            </div>
            
            <button
                onClick={() => handleLanguageChange('original', 'Original')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                    activeTab === 'original'
                    ? 'bg-white text-gray-900 border-gray-300 shadow-sm ring-2 ring-purple-100'
                    : 'bg-transparent text-gray-500 border-transparent hover:bg-white hover:text-gray-700'
                }`}
            >
                Original
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            {LANGUAGES.map((lang) => (
                <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id, lang.label)}
                    disabled={isTranslating && activeTab !== lang.id && activeTab !== 'original' && !translations[lang.id]}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 border flex items-center gap-2 ${
                        activeTab === lang.id
                        ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-transparent shadow-md shadow-purple-500/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:shadow-sm'
                    } ${isTranslating ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}
                >
                    {lang.label}
                    {activeTab === lang.id && isTranslating && !translations[lang.id] && (
                        <Loader2 className="w-3 h-3 animate-spin text-white/80" />
                    )}
                    {translations[lang.id] && activeTab !== lang.id && (
                        <Check className="w-3 h-3 text-green-500" />
                    )}
                </button>
            ))}
        </div>
      </div>
      
      <div className="p-8 md:p-12 bg-gradient-to-b from-white to-purple-50/20 min-h-[300px]">
        {isTranslating && activeTab !== 'original' && !translations[activeTab] ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center animate-fade-in">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-200 blur-xl rounded-full opacity-50 animate-pulse"></div>
                    <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-bold text-gray-800">Translating...</h4>
                    <p className="text-gray-500 text-sm">Converting text to {LANGUAGES.find(l => l.id === activeTab)?.label}</p>
                </div>
            </div>
        ) : (
            <div className="prose prose-lg prose-slate max-w-none text-gray-700 leading-8 font-normal animate-fade-in">
                {currentText.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                    <p key={idx} className="mb-6 last:mb-0">
                        {paragraph}
                    </p>
                    )
                ))}
            </div>
        )}
      </div>
    </div>
  );
};