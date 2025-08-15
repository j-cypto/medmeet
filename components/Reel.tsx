'use client';
import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';
import { linkify } from '@/lib/text';

export default function Reel({ post, active }: { post: Post; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
  }, [muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && post.type === 'video' && post.video_url) {
      v.play().catch(()=>{});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active, post]);

  return (
    <article className="card overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-semibold">{post.title ?? 'Untitled'}</h3>
        <div className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1">{post.type.toUpperCase()}</div>
      </div>
      {post.type === 'video' && post.video_url ? (
        <div className="relative">
          <video ref={videoRef} playsInline controls={false} className="w-full max-h-[70vh]" src={post.video_url} />
          <button onClick={()=>setMuted(m=>!m)} className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 text-gray-800 prose" dangerouslySetInnerHTML={{ __html: linkify(post.content || '') }} />
      )}
      {post.tags && post.tags.length>0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">{post.tags.map(t=><span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">#{t}</span>)}</div>
      )}
    </article>
  );
}
