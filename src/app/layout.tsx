import React from 'react';
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STText | AI Speech to Text",
  description: "A high-accuracy, bilingual speech-to-text assistant using Gemini Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased bg-[#FDFCF8] selection:bg-purple-100 selection:text-purple-900 relative`}>
        
        {/* 
          ========================================
          Global Ambient Background
          ========================================
        */}
        <div className="fixed inset-0 w-full h-full overflow-hidden -z-50 pointer-events-none">
          {/* Base Mesh Gradient */}
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob opacity-80" />
          <div className="absolute top-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000 opacity-80" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-sky-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000 opacity-80" />
          
          {/* Subtle noise texture for premium feel */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}