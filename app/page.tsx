'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/lib/types';
import Reel from '@/components/Reel';
import LikeCommentBar from '@/components/LikeCommentBar';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').eq('hidden', false).order('created_at', { ascending: false }).limit(100);
    setPosts((data || []) as any);
  }

  // swipe & wheel navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0, endY = 0;
    function onWheel(e: WheelEvent) {
      if (e.deltaY > 20) setIndex(i => Math.min(i+1, posts.length-1));
      if (e.deltaY < -20) setIndex(i => Math.max(i-1, 0));
    }
    function onTouchStart(e: TouchEvent) { startY = e.touches[0].clientY; }
    function onTouchEnd(e: TouchEvent) { endY = e.changedTouches[0].clientY; const dy = endY - startY; if (dy < -30) setIndex(i=>Math.min(i+1, posts.length-1)); if (dy > 30) setIndex(i=>Math.max(i-1, 0)); }
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('wheel', onWheel); el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [posts]);

  return (
    <div ref={containerRef} className="space-y-4">
      <h1 className="text-2xl font-bold">Feed</h1>
      {posts.length === 0 && <div className="text-gray-600">No posts yet. Be the first to upload!</div>}
      <div className="grid gap-4">
        {posts.map((p, i) => (
          <div key={p.id}>
            <Reel post={p} active={i===index} />
            <LikeCommentBar targetType="post" targetId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
