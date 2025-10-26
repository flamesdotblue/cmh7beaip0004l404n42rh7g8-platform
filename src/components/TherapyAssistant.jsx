import { useEffect, useRef, useState, useMemo } from 'react';
import { Mic, Volume2, Send, AlertTriangle, Brain, Sparkles } from 'lucide-react';
import { getItem, setItem } from '../utils/secureStore';

const CRISIS_LINKS = [
  { label: 'Emergency Services (Local)', url: 'tel:112' },
  { label: '988 Suicide & Crisis Lifeline (US)', url: 'tel:988' },
  { label: 'International Helplines', url: 'https://www.opencounseling.com/suicide-hotlines' },
];

const negativeLexicon = ['hopeless','worthless','suicide','kill myself','end it','no way out','hate myself','anxious','panic','overwhelmed','depressed','empty','useless','die','self-harm','cut','alone','exhausted','tired of life','stressed'];
const positiveLexicon = ['grateful','hopeful','proud','calm','peaceful','happy','joy','excited','motivated','okay','better','progress'];

function analyzeMood(text) {
  const t = text.toLowerCase();
  const neg = negativeLexicon.reduce((acc,w)=> acc + (t.includes(w)?1:0),0);
  const pos = positiveLexicon.reduce((acc,w)=> acc + (t.includes(w)?1:0),0);
  const score = pos - neg;
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
    return 'Let’s try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. We can do 4 cycles together.';
  if (t.includes('worthless') || t.includes('hate myself'))
    return 'Let’s challenge that thought. What evidence supports it? What evidence does not? What’s a kinder, balanced reframe?';
  if (t.includes('overwhelmed') || t.includes('stressed'))
    return 'Break it down. What is one 2-minute step you could take right now?';
  if (t.includes('alone'))
    return 'Connection helps. Is there one person you could message today, even just to say hi?';
  return 'Notice–Name–Reframe: write the thought, rate belief 0–100%, craft a balanced thought, then re-rate.';
}

function dbtTip() {
  const tips = [
    'TIP skill: Temperature (cool water), Intense exercise 10m, Paced breathing, Paired muscle relaxation.',
    'Radical acceptance: Allow what you cannot change right now; choose the next effective step.',
    'Wise mind: Observe, describe, participate — one-mindfully, non-judgmentally, effectively.',
    'Opposite action: If urges say withdraw, try a gentle, value-aligned engagement.',
  ];
  return tips[Math.floor(Math.random()*tips.length)];
}

export default function TherapyAssistant({ persistMode }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi, I’m here with you. How are you feeling right now? You can use the mic and I’ll listen.' }
  ]);
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
    utter.rate = 1; utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const crisisRegex = useMemo(() => new RegExp('(suicide|kill myself|end it|die|self-?harm|hurt myself)', 'i'), []);

  const lastUserMessage = useMemo(() => {
    const rev = [...messages].reverse();
    return rev.find(m => m.role === 'user')?.text || '';
  }, [messages]);

  const showCrisis = useMemo(() => crisisRegex.test(lastUserMessage), [crisisRegex, lastUserMessage]);

  const handleSend = async (userText) => {
    const text = (userText ?? input).trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');

    const moodInfo = analyzeMood(text);

    try {
      const prev = (await getItem('mh_moodHistory', persistMode)) || [];
      const newEntry = { ts: Date.now(), mood: moodInfo.mood, score: moodInfo.score, sample: text.slice(0,120) };
      await setItem('mh_moodHistory', [...prev, newEntry], persistMode);
    } catch {}

    let reply = '';
    if (showCrisis || moodInfo.mood === 'distressed') {
      reply = 'I’m really glad you told me. Your safety matters. If you’re in immediate danger or considering harming yourself, please seek urgent help now. I can stay with you here while you reach out.';
    } else {
      const cbt = cbtSuggestion(text);
      const tip = dbtTip();
      reply = `I hear you. It sounds ${moodInfo.mood}. ${cbt} Here’s a DBT skill to try: ${tip}`;
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
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Brain size={18} />
          <span className="text-sm">CBT/DBT-informed assistant</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><Sparkles size={14} /> Voice {('speechSynthesis' in window) ? 'On' : 'Unavailable'}</span>
        </div>
      </div>

      <div className="h-[340px] overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[90%] md:max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role==='user' ? 'ml-auto bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/10 border border-white/15'}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => speak(messages.filter(m=>m.role==='assistant').slice(-1)[0]?.text || 'Hello')} title="Speak last reply" className={`inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 transition h-10 w-10 ${speaking ? 'animate-pulse' : ''}`}>
          <Volume2 size={18} />
        </button>
        <button onClick={startListening} disabled={!('webkitSpeechRecognition' in window)} title="Voice input" className={`inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 transition h-10 w-10 ${listening ? 'ring-2 ring-indigo-400' : ''}`}>
          <Mic size={18} />
        </button>
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==='Enter') handleSend(); }}
          placeholder="Share what’s on your mind..."
          className="flex-1 h-10 rounded-lg bg-white/10 border border-white/15 px-3 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400"
        />
        <button onClick={() => handleSend()} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-95 transition">
          <Send size={16} /> Send
        </button>
      </div>

      {showCrisis && (
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
