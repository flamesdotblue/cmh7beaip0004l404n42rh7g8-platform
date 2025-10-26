import React, { useEffect, useMemo, useState } from 'react';
import { NotebookPen, Save, Calendar, Star } from 'lucide-react';
import { setItem, getItem } from '../utils/secureStore';

const PROMPTS = [
  'Describe a thought that’s bothering you. What evidence supports it? What evidence does not?',
  'Name three things you’re grateful for today and why they matter.',
  'If your best friend felt how you do, what would you tell them?',
  'What is one value you want to live by this week? What’s a small action aligned with it?',
  'Identify any cognitive distortions (all-or-nothing, mind reading, catastrophizing) that appeared today.',
];

export default function Journal({ persistMode }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState(5);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    (async () => {
      const saved = await getItem('mh_journal', persistMode);
      if (saved) setEntries(saved);
    })();
  }, [persistMode]);

  const saveEntry = async () => {
    const newEntry = { id: crypto.randomUUID(), ts: Date.now(), prompt: PROMPTS[promptIndex], text: entry.trim(), mood: Number(mood) };
    if (!newEntry.text) return;
    const updated = [newEntry, ...entries].slice(0, 1000);
    await setItem('mh_journal', updated, persistMode);
    setEntries(updated);
    setEntry('');
  };

  const todayCount = entries.filter(e => new Date(e.ts).toDateString() === new Date().toDateString()).length;
  const streak = computeStreak(entries);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/80"><NotebookPen size={18} /><span className="text-sm">Guided journaling (CBT)</span></div>
        <div className="text-xs text-white/60 flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Calendar size={14} /> Today: {todayCount}</span>
          <span className="inline-flex items-center gap-1"><Star size={14} /> Streak: {streak}d</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="rounded-lg border border-white/15 bg-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Prompt</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPromptIndex((i)=> (i-1+PROMPTS.length)%PROMPTS.length)} className="text-xs px-2 py-1 rounded bg-white/10 border border-white/15 hover:bg-white/15">Prev</button>
                <button onClick={() => setPromptIndex((i)=> (i+1)%PROMPTS.length)} className="text-xs px-2 py-1 rounded bg-white/10 border border-white/15 hover:bg-white/15">Next</button>
              </div>
            </div>
            <p className="mt-1 text-white/90 text-sm">{PROMPTS[promptIndex]}</p>
          </div>
          <textarea value={entry} onChange={(e)=>setEntry(e.target.value)} rows={6} placeholder="Write freely. It’s just for you."
            className="w-full rounded-lg bg-white/10 border border-white/15 p-3 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-violet-400" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70">Mood:</span>
              <input type="range" min={1} max={10} value={mood} onChange={(e)=>setMood(e.target.value)} />
              <span className="text-sm text-white/80">{mood}/10</span>
            </div>
            <button onClick={saveEntry} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-95 transition"><Save size={16}/> Save</button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Recent entries</h4>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {entries.length === 0 && <p className="text-xs text-white/50">No entries yet.</p>}
            {entries.map(e => (
              <div key={e.id} className="rounded-lg border border-white/15 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{new Date(e.ts).toLocaleString()}</span>
                  <span>Mood {e.mood}/10</span>
                </div>
                <p className="mt-2 text-sm text-white/90 whitespace-pre-wrap">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function computeStreak(entries) {
  if (!entries?.length) return 0;
  const days = new Set(entries.map(e => new Date(e.ts).toDateString()));
  let streak = 0;
  let d = new Date();
  for (;;) {
    const key = d.toDateString();
    if (days.has(key)) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}
