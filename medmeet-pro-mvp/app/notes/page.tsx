'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Note } from '@/lib/types';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => { fetchNotes(); }, []);
  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').eq('hidden', false).order('created_at', { ascending: false }).limit(100);
    setNotes((data || []) as any);
  }

  const filtered = notes.filter(n => [n.title, n.description, n.subject, (n.tags||[]).join(' ')].join(' ').toLowerCase().includes(q.toLowerCase()));

  async function upvote(id: string) {
    await supabase.rpc('increment_note_upvotes', { note_id: id });
    fetchNotes();
  }

  async function addToCollection(noteId: string) {
    const name = prompt('Collection name (existing or new):');
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert('Sign in'); return; }
    let { data: col } = await supabase.from('collections').select('*').eq('owner_id', user.id).eq('name', name).maybeSingle();
    if (!col) {
      const ins = await supabase.from('collections').insert({ owner_id: user.id, name }).select().single();
      col = ins.data;
    }
    await supabase.from('collection_items').insert({ collection_id: col.id, target_type: 'note', target_id: noteId });
    alert('Added to collection');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shared Notes</h1>
      <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search notes…" className="border rounded-xl px-3 py-2 w-full" />
      <div className="grid gap-4">
        {filtered.map(n => (
          <article key={n.id} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{n.title}</h3>
              <span className="text-sm text-gray-600">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700">{n.description}</p>
            <a href={n.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-brand-700 font-semibold">Open note ↗</a>
            {n.subject && <div className="text-xs text-gray-600">Subject: {n.subject}</div>}
            {n.tags && n.tags.length>0 && <div className="flex flex-wrap gap-2">{n.tags.map(t=><span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">#{t}</span>)}</div>}
            <div className="flex gap-2 pt-2">
              <button onClick={()=>upvote(n.id)} className="px-3 py-1 rounded-lg bg-gray-100">▲ {n.upvotes||0}</button>
              <button onClick={()=>addToCollection(n.id)} className="px-3 py-1 rounded-lg bg-gray-100">+ Collection</button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-gray-600">No notes found.</div>}
    </div>
  );
}
