'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Resource, ResourceReview } from '@/lib/types';
import AuthGate from '@/components/AuthGate';
import LikeCommentBar from '@/components/LikeCommentBar';

export default function ResourcesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resource Library</h1>
      <p className="text-gray-700">Share the best apps, channels, decks, and textbooks. Rate what works.</p>
      <AuthGate><AddResourceForm /></AuthGate>
      <ResourceList />
    </div>
  );
}

function AddResourceForm() {
  async function submit(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = f.get('title') as string;
    const link = f.get('link') as string;
    const category = (f.get('category') as string) || null;
    await supabase.from('resources').insert({ title, link, category });
    e.currentTarget.reset();
    alert('Resource added!');
  }
  return (
    <form onSubmit={submit} className="card p-4 grid gap-2">
      <div className="grid md:grid-cols-3 gap-2">
        <input name="title" className="border rounded-xl px-3 py-2" placeholder="Title" required />
        <input name="link" className="border rounded-xl px-3 py-2" placeholder="URL" required />
        <input name="category" className="border rounded-xl px-3 py-2" placeholder="Category (e.g., NCLEX, Med-Surg)" />
      </div>
      <button className="bg-brand-600 text-white py-2 rounded-xl font-semibold hover:bg-brand-700 w-max px-4">Add</button>
    </form>
  );
}

function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => { (async () => {
    const { data } = await supabase.from('resources').select('*, resource_reviews(count, rating)').order('created_at', { ascending: false }).limit(200);
    const withAgg = (data || []).map((r: any) => {
      const reviews = r.resource_reviews || [];
      const avg = reviews.length ? reviews.reduce((a: number, b: any)=>a + (b.rating||0), 0)/reviews.length : null;
      return { ...r, avg_rating: avg, review_count: reviews.length };
    });
    setResources(withAgg);
  })(); }, []);

  return (
    <div className="grid gap-3">
      {resources.map(r => (
        <div key={r.id} className="card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <a href={r.link} target="_blank" rel="noreferrer" className="font-semibold link">{r.title}</a>
            <div className="text-sm text-gray-600">{r.avg_rating ? `★ ${r.avg_rating.toFixed(1)} (${r.review_count})` : 'Unrated'}</div>
          </div>
          <div className="text-sm text-gray-600">{r.category}</div>
          <ReviewBox resourceId={r.id} />
          <LikeCommentBar targetType="resource" targetId={r.id} />
        </div>
      ))}
      {resources.length === 0 && <div className="text-gray-600">No resources yet.</div>}
    </div>
  );
}

function ReviewBox({ resourceId }: { resourceId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  async function submit(e: any) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert('Sign in'); return; }
    await supabase.from('resource_reviews').insert({ resource_id: resourceId, user_id: user.id, rating, comment: comment || null });
    setComment(''); alert('Review posted!');
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <select value={rating} onChange={(e)=>setRating(Number(e.target.value))} className="border rounded-xl px-2 py-1">
        {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
      </select>
      <input value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Add a short review…" className="flex-1 border rounded-xl px-3 py-1" />
      <button className="px-3 py-1 rounded-xl bg-gray-900 text-white">Rate</button>
    </form>
  );
}
