import { useState } from 'react';
import Hero from './components/Hero';
import TherapyAssistant from './components/TherapyAssistant';
import Journal from './components/Journal';
import WellnessTools from './components/WellnessTools';

export default function App() {
  const [persistMode, setPersistMode] = useState(true); // true = encrypted localStorage, false = session-only

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <Hero persistMode={persistMode} setPersistMode={setPersistMode} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-16 pb-20">
        <section id="assistant" className="scroll-mt-24">
          <TherapyAssistant persistMode={persistMode} />
        </section>

        <section id="journal" className="scroll-mt-24">
          <Journal persistMode={persistMode} />
        </section>

        <section id="tools" className="scroll-mt-24">
          <WellnessTools persistMode={persistMode} />
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-400">
        This app offers supportive tools and is not a substitute for professional care. If you are in crisis, seek immediate help via local emergency numbers or crisis hotlines.
      </footer>
    </div>
  );
}
