import React from 'react';
import { Languages, Mic } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/40 shadow-sm backdrop-blur-xl bg-white/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 transform hover:rotate-6 transition-transform duration-300">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              ST<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Text</span>
            </h1>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 text-purple-700 rounded-full text-sm font-bold border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <Languages className="w-4 h-4 text-purple-500" />
          <span>Auto-Language Detection</span>
        </div>
      </div>
    </header>
  );
};