'use client';
import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { extractTags } from '@/lib/text';
import { useState } from 'react';

export default function UploadPage() {
  return (<AuthGate><UploadInner /></AuthGate>);
}

function UploadInner() {
  const [type, setType] = useState<'video'|'text'|'note'>('video');
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault(); setLoading(true);
    const form = new FormData(e.currentTarget);
    const title = form.get('title') as string;
    const content = (form.get('content') as string) || '';
    const file = form.get('file') as File | null;
    const subject = (form.get('subject') as string) || null;
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;

    const tags = extractTags(title + ' ' + content);
    if (type === 'video' && file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from('videos').upload(path, file);
      if (up.error) { alert(up.error.message); setLoading(false); return; }
      const pub = supabase.storage.from('videos').getPublicUrl(up.data.path).data.publicUrl;
      await supabase.from('posts').insert({ title, type: 'video', video_url: pub, author_id: user.id, tags });
    } else if (type === 'text') {
      await supabase.from('posts').insert({ title, type: 'text', content, author_id: user.id, tags });
    } else if (type === 'note' && file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from('notes').upload(path, file);
      if (up.error) { alert(up.error.message); setLoading(false); return; }
      const pub = supabase.storage.from('notes').getPublicUrl(up.data.path).data.publicUrl;
      await supabase.from('notes').insert({ title, description: content, subject, file_url: pub, author_id: user.id, tags });
    }
    setLoading(false); alert('Uploaded!'); e.currentTarget.reset();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Upload</h1>
      <div className="card p-4 space-y-4">
        <div className="flex gap-2">
          {(['video','text','note'] as const).map(opt => (
            <button key={opt} onClick={()=>setType(opt)} className={`px-3 py-2 rounded-xl text-sm ${type===opt?'bg-brand-600 text-white':'bg-gray-100'}`}>
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="grid gap-3">
          <input name="title" placeholder="Title (use #hashtags, @mentions)" className="border rounded-xl px-3 py-2" required />
          {type === 'text' && <textarea name="content" placeholder="Share a study tip… (#tags and @mentions supported)" className="border rounded-xl px-3 py-2 min-h-[120px]" />}
          {type !== 'text' && <input type="file" name="file" accept={type==='video'?'video/mp4,video/*':'.pdf,.doc,.docx,.ppt,.pptx,.txt'} className="border rounded-xl px-3 py-2" required />}
          {type === 'note' && <input name="subject" placeholder="Subject (e.g., Cardio, Med-Surg)" className="border rounded-xl px-3 py-2" />}
          {type !== 'text' && <textarea name="content" placeholder={type==='video'?'Optional: description':'Short description'} className="border rounded-xl px-3 py-2 min-h-[80px]" />}
          <button className="bg-brand-600 text-white py-2 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50" disabled={loading}>
            {loading ? 'Uploading…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
