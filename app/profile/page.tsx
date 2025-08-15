'use client';
import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  return (<AuthGate><ProfileInner /></AuthGate>);
}

function ProfileInner() {
  const [full_name, setName] = useState('');
  const [role, setRole] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [digest, setDigest] = useState(true);

  useEffect(()=>{ (async ()=>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setName(data.full_name ?? ''); setRole(data.role ?? ''); setDiscipline(data.discipline ?? '');
      const pref = await supabase.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle();
      setDigest(pref.data?.daily_digest ?? true);
    }
  })(); }, []);

  async function save(e: any) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    await supabase.from('profiles').upsert({ id: user.id, full_name, role: role||null, discipline: discipline||null });
    await supabase.from('notification_settings').upsert({ user_id: user.id, daily_digest: digest });
    alert('Profile saved');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <form onSubmit={save} className="card p-4 grid gap-3 max-w-xl">
        <input className="border rounded-xl px-3 py-2" placeholder="Full name" value={full_name} onChange={(e)=>setName(e.target.value)} />
        <select className="border rounded-xl px-3 py-2" value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="">Select role</option>
          <option value="student">Student</option><option value="lpn">LPN</option><option value="rn">RN</option>
          <option value="md">MD</option><option value="pa">PA</option><option value="np">NP</option><option value="other">Other</option>
        </select>
        <input className="border rounded-xl px-3 py-2" placeholder="Discipline (e.g., Med-Surg, OB/PEDS)" value={discipline} onChange={(e)=>setDiscipline(e.target.value)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={digest} onChange={(e)=>setDigest(e.target.checked)} /> Receive daily email digest (setup in README)</label>
        <button className="bg-brand-600 text-white py-2 rounded-xl font-semibold hover:bg-brand-700 w-max px-4">Save</button>
      </form>
    </div>
  );
}
