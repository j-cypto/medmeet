'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Job } from '@/lib/types';
import AuthGate from '@/components/AuthGate';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.from('jobs').select('*').eq('hidden', false).order('posted_at', { ascending: false }).limit(100);
    setJobs((data || []) as any);
  })(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Job Board</h1>
      <p className="text-gray-700">Entry-level to advanced roles. Organizations can post openings here.</p>
      <AuthGate><AddJobForm /></AuthGate>
      <div className="grid gap-3">
        {jobs.map(j => (
          <article key={j.id} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{j.title}</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{new Date(j.posted_at).toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-700">{j.company} • {j.location ?? 'Remote'}</div>
            <p className="text-gray-700">{j.description ?? ''}</p>
            <a href={j.url} target="_blank" rel="noreferrer" className="inline-flex items-center text-brand-700 font-semibold">Apply ↗</a>
          </article>
        ))}
        {jobs.length === 0 && <div className="text-gray-600">No jobs yet.</div>}
      </div>
      <AuthGate><FeedImporter /></AuthGate>
    </div>
  );
}

function AddJobForm() {
  async function submit(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      company: f.get('company') as string,
      title: f.get('title') as string,
      location: (f.get('location') as string) || null,
      url: f.get('url') as string,
      description: (f.get('description') as string) || null,
      posted_at: new Date().toISOString(),
    };
    await supabase.from('jobs').insert(payload);
    e.currentTarget.reset();
    alert('Job posted!');
  }

  return (
    <form onSubmit={submit} className="card p-4 grid gap-2">
      <div className="grid md:grid-cols-4 gap-2">
        <input name="company" className="border rounded-xl px-3 py-2" placeholder="Company" required />
        <input name="title" className="border rounded-xl px-3 py-2" placeholder="Job title" required />
        <input name="location" className="border rounded-xl px-3 py-2" placeholder="Location (or Remote)" />
        <input name="url" className="border rounded-xl px-3 py-2" placeholder="Application URL" required />
      </div>
      <textarea name="description" className="border rounded-xl px-3 py-2 min-h-[90px]" placeholder="Short description"></textarea>
      <button className="bg-brand-600 text-white py-2 rounded-xl font-semibold hover:bg-brand-700 w-max px-4">Post Job</button>
    </form>
  );
}

function FeedImporter() {
  async function addFeed(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const url = f.get('url') as string;
    await supabase.from('job_feeds').insert({ url });
    e.currentTarget.reset();
    alert('Feed saved (manual import supported below).');
  }
  async function importJSON(e: any) {
    e.preventDefault();
    const raw = (new FormData(e.currentTarget).get('json') as string) || '[]';
    let items: any[] = [];
    try { items = JSON.parse(raw); } catch { alert('Invalid JSON'); return; }
    for (const it of items) {
      await supabase.from('jobs').insert({
        company: it.company || 'Unknown',
        title: it.title || 'Role',
        location: it.location || null,
        url: it.url || '#',
        description: it.description || null,
        posted_at: it.posted_at || new Date().toISOString()
      });
    }
    alert('Imported jobs! Reload the page.');
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form onSubmit={addFeed} className="card p-4 space-y-2">
        <h3 className="font-semibold">Add Job Feed URL</h3>
        <input name="url" className="border rounded-xl px-3 py-2 w-full" placeholder="https://example.com/jobs.json" required />
        <button className="bg-gray-900 text-white px-3 py-2 rounded-xl w-max">Save Feed</button>
        <p className="text-xs text-gray-500">For now, feeds are stored; import via JSON below or wire a Vercel cron to fetch.</p>
      </form>
      <form onSubmit={importJSON} className="card p-4 space-y-2">
        <h3 className="font-semibold">Manual Import (paste JSON array)</h3>
        <textarea name="json" className="border rounded-xl px-3 py-2 min-h-[120px]" placeholder='[{"company":"X","title":"Y","url":"https://..."}]'></textarea>
        <button className="bg-gray-900 text-white px-3 py-2 rounded-xl w-max">Import</button>
      </form>
    </div>
  );
}
