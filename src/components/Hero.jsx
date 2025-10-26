import Spline from '@splinetool/react-spline';
import { Shield, Lock } from 'lucide-react';

export default function Hero({ persistMode, setPersistMode }) {
  return (
    <header className="relative w-full">
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-slate-950/50 to-slate-950" />

        <nav className="absolute top-0 inset-x-0 z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-fuchsia-500 via-indigo-500 to-cyan-400" />
            <span className="text-white font-semibold tracking-wide">Auraloom</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#assistant" className="text-white/80 hover:text-white transition">Assistant</a>
            <a href="#journal" className="text-white/80 hover:text-white transition">Journal</a>
            <a href="#tools" className="text-white/80 hover:text-white transition">Tools</a>
          </div>
        </nav>

        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">Therapy chatbot companion for calmer days</h1>
            <p className="mt-4 text-white/85 md:text-lg">Evidence-based support with CBT journaling, mood insights, and playful micro-practices — privacy-first and optionally voice-enabled.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#assistant" className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-5 py-3 font-medium hover:bg-white/90 transition">Start Talking</a>
              <button onClick={() => setPersistMode((p) => !p)} className="inline-flex items-center gap-2 rounded-lg bg-white/10 text-white px-4 py-3 hover:bg-white/15 transition">
                {persistMode ? <Shield size={18} /> : <Lock size={18} />}
                <span className="text-sm">{persistMode ? 'Encrypted Local Mode' : 'Anonymous (Session)'}</span>
              </button>
            </div>
            <div className="mt-3 text-xs text-white/70 flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1"><Lock size={14} /> Encrypted storage</span>
              <span className="inline-flex items-center gap-1"><Shield size={14} /> No account required</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
