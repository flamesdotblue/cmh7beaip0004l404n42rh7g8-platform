import React from 'react';
import Spline from '@splinetool/react-spline';
import { Shield, Lock, Moon, Sun } from 'lucide-react';

export default function Hero({ persistMode, setPersistMode }) {
  return (
    <header className="relative w-full">
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-[#0b0f1a]/60 to-[#0b0f1a]" />
        <nav className="absolute top-0 inset-x-0 z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400" />
            <span className="text-white/90 font-semibold tracking-wide">Auraloom</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#assistant" className="text-white/80 hover:text-white transition text-sm">Assistant</a>
            <a href="#journal" className="text-white/80 hover:text-white transition text-sm">Journal</a>
            <a href="#dashboard" className="text-white/80 hover:text-white transition text-sm">Dashboard</a>
          </div>
        </nav>
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">Your AI Therapy Companion</h1>
            <p className="mt-4 text-white/80 md:text-lg">Evidence-based support for mood, mindfulness, and mental fitness — private, secure, and always available.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#assistant" className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-5 py-3 font-medium hover:bg-white/90 transition">Start Talking</a>
              <button onClick={() => setPersistMode(p => !p)} className="inline-flex items-center gap-2 rounded-lg bg-white/10 text-white px-4 py-3 hover:bg-white/15 transition">
                {persistMode ? <Shield size={18} /> : <Lock size={18} />}
                <span className="text-sm">{persistMode ? 'Encrypted Local Mode' : 'Anonymous (Session)'}</span>
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/70">
              <div className="flex items-center gap-1"><Lock size={14} /> End-to-end encrypted storage</div>
              <div className="flex items-center gap-1"><Shield size={14} /> Private, no accounts required</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
