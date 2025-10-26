import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Volume2, Send, AlertTriangle, Brain, Sparkles } from 'lucide-react';
import { setItem, getItem } from '../utils/secureStore';

const CRISIS_LINKS = [
  { label: 'Emergency Services', url: 'tel:911' },
  { label: '988 Suicide & Crisis Lifeline (US)', url: 'tel:988' },
  { label: 'International Helplines', url: 'https://www.opencounseling.com/suicide-hotlines' },
];

const negativeLexicon = ['hopeless','worthless','suicide','kill myself','end it','no way out','hate myself','anxious','panic','overwhelmed','depressed','empty','useless','die','self-harm','cut','alone','exhausted','tired of life'];
const positiveLexicon = ['grateful','hopeful','proud','calm','peaceful','happy','joy','excited','motivated','okay','better','progress'];

function analyzeMood(text) {
  const t = text.toLowerCase();
  const neg = negativeLexicon.reduce((acc,w)=> acc + (t.includes(w)?1:0),0);
  const pos = positiveLexicon.reduce((acc,w)=> acc + (t.includes(w)?1:0),0);
  const score = pos - neg; // simple heuristic
  let mood = 'neutral';
  if (score >= 2) mood = 'positive';
  else if (score <= -2) mood = 'distressed';
  else if (score < 0) mood = 'low';
  else if (score > 0) mood = 'uplifted';
  return { score, mood, neg, pos };
}

function cbtSuggestion(text) {
  const t = text.toLowerCase();
  if (t.includes('anxious') || t.includes('panic'))
    return 'Try a 4-7-8 breathing cycle: inhale 4s, hold 7s, exhale 8s. Let’s do 4 cycles together.';
  if (t.includes('worthless') || t.includes('hate myself'))
    return 'Let’s challenge this thought. Evidence for and against it? What would you say to a friend feeling this way?';
  if (t.includes('overwhelmed'))
    return 'Break tasks into tiny steps. What is one 2-minute action you can do now?';
  if (t.includes('alone'))
    return 'Connection helps. Is there one person you could message today, even just to say hi?';
  return 'Notice-thoughts technique: Write the thought, rate belief 0-100%, reframe, then re-rate. Aim to spot cognitive distortions (all-or-nothing, mind reading, catastrophizing).';
}

function dbtTip() {
  const tips = [
    'TIP skill: Temperature (splash cool water), Intense exercise for 10 minutes, Paced breathing, Paired muscle relaxation.',
    'Radical acceptance: Allow what’s out of your control, choose your next effective step.',
    'Wise mind: Observe, describe, participate — one-mindfully, non-judgmentally, effectively.',
    'Opposite action: If sadness makes you withdraw, try gentle engagement with a supportive activity.',
  ];
  return tips[Math.floor(Math.random()*tips.length)];
}

export default function ChatAssistant({ persistMode }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: 'Hi, I’m here with you. How are you feeling right now? You can also use the mic and I’ll listen.',
  }]);
  const [input, setInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const rec = new window.webkitSpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
      };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const escalateNeeded = (t) => {
    const { neg, mood } = analyzeMood(t);
    return neg >= 2 || mood === 'distressed' || /suicide|kill myself|end it|die|self-harm/.test(t.toLowerCase());
  };

  const handleSend = async (userText) => {
    const text = (userText ?? input).trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');

    const moodInfo = analyzeMood(text);

    // Save mood to encrypted history for analytics
    try {
      const prev = (await getItem('mh_moodHistory', persistMode)) || [];
      const newEntry = { ts: Date.now(), mood: moodInfo.mood, score: moodInfo.score, sample: text.slice(0,120) };
      await setItem('mh_moodHistory', [...prev, newEntry], persistMode);
    } catch (e) {
      // ignore
    }

    let reply = '';
    if (escalateNeeded(text)) {
      reply = 'I’m really glad you reached out. Your safety matters. If you’re in immediate danger or considering harming yourself, please seek urgent help. I can stay with you here while you reach out.';
    } else {
      const cbt = cbtSuggestion(text);
      const tip = dbtTip();
      reply = `I hear you. Based on what you shared, you might be feeling ${moodInfo.mood}. ${cbt} Here’s a DBT skill you can try: ${tip}`;
    }

    setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    speak(reply);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/80">
          <Brain size={18} />
          <span className="text-sm">CBT/DBT-informed assistant</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="inline-flex items-center gap-1"><Sparkles size={14} /> Voice {('speechSynthesis' in window) ? 'On' : 'Unavailable'}</span>
        </div>
      </div>

      <div className="h-[340px] overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[90%] md:max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.role==='user' ? 'ml-auto bg-violet-500/20 border border-violet-500/30' : 'bg-white/10 border border-white/15'}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => speak(messages.filter(m=>m.role==='assistant').slice(-1)[0]?.text || 'Hello')} title="Speak last reply" className={`inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 transition h-10 w-10 ${speaking ? 'animate-pulse' : ''}`}>
          <Volume2 size={18} />
        </button>
        <button onClick={startListening} disabled={!('webkitSpeechRecognition' in window)} title="Voice input" className={`inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 transition h-10 w-10 ${listening ? 'ring-2 ring-violet-400' : ''}`}>
          <Mic size={18} />
        </button>
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==='Enter') handleSend(); }}
          placeholder="Share what’s on your mind..."
          className="flex-1 h-10 rounded-lg bg-white/10 border border-white/15 px-3 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-violet-400"
        />
        <button onClick={() => handleSend()} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-95 transition">
          <Send size={16} /> Send
        </button>
      </div>

      {messages.length > 1 && (/
        suicide|kill myself|end it|die|self-harm|hurt myself/i.test(messages[messages.length-1].text)
      ) && (
        <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm">
          <div className="flex items-center gap-2 text-rose-300"><AlertTriangle size={16} /> Crisis resources</div>
          <ul className="mt-2 list-disc list-inside space-y-1 text-rose-200/90">
            {CRISIS_LINKS.map((l)=> (
              <li key={l.url}><a className="underline hover:text-rose-100" href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
