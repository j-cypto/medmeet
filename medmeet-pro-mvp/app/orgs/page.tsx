'use client';
import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import type { Org } from '@/lib/types';

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  useEffect(()=>{ (async ()=>{
    const { data } = await supabase.from('orgs').select('*').order('created_at', { ascending: false }).limit(100);
    setOrgs((data||[]) as any);
  })(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Organizations</h1>
      <p className="text-gray-700">Create an org profile to post jobs and resources under your brand.</p>
      <AuthGate><CreateOrg /></AuthGate>
      <div className="grid gap-3">
        {orgs.map(o => (
          <div key={o.id} className="card p-4">
            <div className="font-semibold">{o.name}</div>
            <a className="link text-sm" href={o.website || '#'} target="_blank" rel="noreferrer">{o.website}</a>
          </div>
        ))}
        {orgs.length===0 && <div className="text-gray-600">No orgs yet.</div>}
      </div>
    </div>
  );
}

function CreateOrg() {
  async function submit(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = f.get('name') as string;
    const website = (f.get('website') as string) || null;
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    await supabase.from('orgs').insert({ name, website, owner_id: user.id });
    e.currentTarget.reset(); alert('Org created');
  }
  return (
    <form onSubmit={submit} className="card p-4 grid md:grid-cols-3 gap-2">
      <input name="name" className="border rounded-xl px-3 py-2" placeholder="Org name" required />
      <input name="website" className="border rounded-xl px-3 py-2" placeholder="Website (optional)" />
      <button className="bg-brand-600 text-white py-2 rounded-xl font-semibold hover:bg-brand-700 w-max px-4">Create</button>
    </form>
  );
}
