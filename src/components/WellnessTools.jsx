import { useEffect, useMemo, useState } from 'react';
import { Activity, Trophy, Award, CheckCircle, Calendar } from 'lucide-react';
import { getItem, setItem } from '../utils/secureStore';

const DAILY_CHALLENGES = [
  { id: 'gratitude-3', label: 'List 3 gratitudes', points: 10 },
  { id: 'breathe-478', label: 'Do 4-7-8 breathing (4 cycles)', points: 10 },
  { id: 'movement-10', label: '10 minutes gentle movement', points: 15 },
  { id: 'water', label: 'Drink a glass of water', points: 5 },
];

export default function WellnessTools({ persistMode }) {
  const [moodHistory, setMoodHistory] = useState([]);
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState({ date: dateKey(new Date()), done: {} });

  useEffect(() => {
    (async () => {
      const mh = (await getItem('mh_moodHistory', persistMode)) || [];
      setMoodHistory(mh);
      const pr = (await getItem('mh_progress', persistMode)) || { date: dateKey(new Date()), done: {} };
      if (pr.date !== dateKey(new Date())) { pr.date = dateKey(new Date()); pr.done = {}; }
      setProgress(pr);
    })();
  }, [persistMode]);

  const addMood = async () => {
    const entry = { ts: Date.now(), mood: scaleLabel(mood), score: mood-5, sample: note.slice(0,120) };
    const updated = [...moodHistory, entry];
    setMoodHistory(updated);
    setNote('');
    await setItem('mh_moodHistory', updated, persistMode);
  };

  const toggleChallenge = async (id) => {
    const updated = { ...progress, date: dateKey(new Date()), done: { ...progress.done, [id]: !progress.done[id] } };
    setProgress(updated);
    await setItem('mh_progress', updated, persistMode);
  };

  const points = useMemo(() => DAILY_CHALLENGES.reduce((acc,c)=> acc + (progress.done[c.id] ? c.points : 0), 0), [progress]);
  const streak = useMemo(() => computeStreak(moodHistory), [moodHistory]);
  const badges = computeBadges(points, streak, moodHistory);

  const last30 = moodHistory.slice(-30);
  const moodCounts = ['distressed','low','neutral','uplifted','positive'].map(k => ({ key: k, count: last30.filter(m=>m.mood===k).length }));
  const maxCount = Math.max(1, ...moodCounts.map(m=>m.count));

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 md:p-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h4 className="text-slate-200 text-sm mb-2 flex items-center gap-2"><Activity size={18}/> Mood tracker</h4>
          <div className="rounded-lg border border-white/15 bg-white/10 p-3">
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={10} value={mood} onChange={(e)=>setMood(Number(e.target.value))} />
              <span className="text-sm text-slate-200">{mood}/10 • {scaleLabel(mood)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Optional note" className="flex-1 h-10 rounded bg-white/10 border border-white/15 px-3 outline-none placeholder:text-slate-400" />
              <button onClick={addMood} className="h-10 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-95 transition">Add</button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {moodCounts.map(m => (
                <div key={m.key} className="text-center">
                  <div className="h-24 w-full bg-white/10 border border-white/15 rounded flex items-end justify-center overflow-hidden">
                    <div style={{ height: `${(m.count/maxCount)*100}%` }} className={`w-full ${barColor(m.key)}`} />
                  </div>
                  <div className="mt-1 text-xs text-slate-300 capitalize">{m.key}</div>
                  <div className="text-xs text-slate-400">{m.count}</div>
                </div>
              ))}
            </div>
          </div>

          <h4 className="text-slate-200 text-sm mt-6 mb-2 flex items-center gap-2"><Calendar size={18}/> Recent mood notes</h4>
          <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
            {moodHistory.slice().reverse().slice(0,12).map((e, i) => (
              <div key={i} className="rounded-lg border border-white/15 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(e.ts).toLocaleString()}</span>
                  <span className="capitalize">{e.mood}</span>
                </div>
                {e.sample && <p className="mt-2 text-sm text-slate-100">{e.sample}</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-slate-200 text-sm mb-2 flex items-center gap-2"><Trophy size={18}/> Daily challenges</h4>
          <div className="rounded-lg border border-white/15 bg-white/10 p-3 space-y-2">
            {DAILY_CHALLENGES.map(ch => (
              <label key={ch.id} className="flex items-center justify-between gap-3 p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer">
                <div className="text-sm text-slate-100">{ch.label}</div>
                <input type="checkbox" className="accent-indigo-500 h-4 w-4" checked={!!progress.done[ch.id]} onChange={()=>toggleChallenge(ch.id)} />
              </label>
            ))}
            <div className="text-xs text-slate-300">Points today: {points}</div>
          </div>

          <h4 className="text-slate-200 text-sm mt-6 mb-2 flex items-center gap-2"><Award size={18}/> Achievements</h4>
          <div className="rounded-lg border border-white/15 bg-white/10 p-3 space-y-2">
            {badges.length === 0 && <div className="text-xs text-slate-400">Complete challenges and track moods to earn badges.</div>}
            {badges.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-100"><CheckCircle size={16} className="text-emerald-400"/> {b}</div>
            ))}
            <div className="text-xs text-slate-400 mt-2">Streak: {streak} days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeStreak(history) {
  if (!history?.length) return 0;
  const days = new Set(history.map(e => new Date(e.ts).toDateString()));
  let streak = 0;
  let d = new Date();
  for (;;) {
    const key = d.toDateString();
    if (days.has(key)) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function computeBadges(points, streak, history) {
  const out = [];
  if (points >= 20) out.push('Daily Momentum');
  if (points >= 40) out.push('Wellness Warrior');
  if (streak >= 3) out.push('3-Day Consistency');
  if (streak >= 7) out.push('Weekly Steady Mind');
  const positives = history.filter(h => h.mood === 'positive' || h.mood === 'uplifted').length;
  if (positives >= 5) out.push('Positivity Builder');
  return out;
}

function dateKey(d) { return d.toISOString().slice(0,10); }

function scaleLabel(val) {
  if (val <= 2) return 'distressed';
  if (val <= 4) return 'low';
  if (val <= 6) return 'neutral';
  if (val <= 8) return 'uplifted';
  return 'positive';
}

function barColor(key) {
  switch(key){
    case 'distressed': return 'bg-rose-500/70';
    case 'low': return 'bg-amber-400/70';
    case 'neutral': return 'bg-slate-300/70';
    case 'uplifted': return 'bg-sky-400/70';
    case 'positive': return 'bg-emerald-400/70';
    default: return 'bg-white/40';
  }
}
