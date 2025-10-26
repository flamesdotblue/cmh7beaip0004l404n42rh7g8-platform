import React, { useState } from 'react';
import Hero from './components/Hero';
import ChatAssistant from './components/ChatAssistant';
import Journal from './components/Journal';
import WellnessDashboard from './components/WellnessDashboard';

export default function App() {
  const [persistMode, setPersistMode] = useState(true); // true = encrypted localStorage, false = anonymous (session-only)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0b0f1a] to-[#0b0f1a] text-white">
      <Hero persistMode={persistMode} setPersistMode={setPersistMode} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 space-y-16 pb-24">
        <section id="assistant" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Therapy Assistant</h2>
            <a href="#dashboard" className="text-sm text-violet-300 hover:text-violet-200 transition">View Dashboard →</a>
          </div>
          <ChatAssistant persistMode={persistMode} />
        </section>

        <section id="journal" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Guided Journaling</h2>
            <a href="#assistant" className="text-sm text-violet-300 hover:text-violet-200 transition">Back to Assistant →</a>
          </div>
          <Journal persistMode={persistMode} />
        </section>

        <section id="dashboard" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Wellness Dashboard</h2>
          </div>
          <WellnessDashboard persistMode={persistMode} />
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        <p>Not a replacement for professional help. If you are in crisis, please seek immediate support.</p>
      </footer>
    </div>
  );
}
