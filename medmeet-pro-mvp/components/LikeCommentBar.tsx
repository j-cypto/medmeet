'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LikeCommentBar({ targetType, targetId }: { targetType: 'post'|'note'|'resource'|'job'; targetId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id;
    const { data: likes } = await supabase.from('likes').select('id').eq('target_type', targetType).eq('target_id', targetId);
    setCount(likes?.length || 0);
    if (uid) {
      const { data: mine } = await supabase.from('likes').select('id').eq('target_type', targetType).eq('target_id', targetId).eq('user_id', uid).maybeSingle();
      setLiked(!!mine);
    }
  })(); }, [targetType, targetId]);

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Sign in to like'); return; }
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('target_type', targetType).eq('target_id', targetId);
      setLiked(false); setCount(c => Math.max(0, c-1));
    } else {
      await supabase.from('likes').insert({ user_id: user.id, target_type: targetType, target_id: targetId });
      setLiked(true); setCount(c => c+1);
    }
  }

  async function addComment(e: any) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Sign in to comment'); return; }
    await supabase.from('comments').insert({ author_id: user.id, target_type: targetType, target_id: targetId, body });
    setText('');
  }

  return (
    <div className="flex items-center gap-4 px-4 pb-4">
      <button onClick={toggleLike} className={`px-3 py-1 rounded-lg border ${liked?'bg-brand-600 text-white border-brand-700':'bg-white text-gray-800'}`}>
        ♥ {count}
      </button>
      <form onSubmit={addComment} className="flex-1 flex gap-2">
        <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Add a comment (@mention, #hashtag)"
               className="flex-1 border rounded-xl px-3 py-1" />
        <button className="px-3 py-1 rounded-xl bg-gray-900 text-white">Post</button>
      </form>
    </div>
  );
}
