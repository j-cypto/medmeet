'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Comment } from '@/lib/types';
import { linkify } from '@/lib/text';

export default function CommentsList({ targetType, targetId }: { targetType: 'post'|'note'|'resource'|'job'; targetId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => { (async () => {
    const { data } = await supabase.from('comments').select('*').eq('target_type', targetType).eq('target_id', targetId).order('created_at', { ascending: true }).limit(100);
    setComments((data || []) as any);
  })(); }, [targetType, targetId]);

  return (
    <div className="px-4 pb-4 space-y-3">
      {comments.map(c => (
        <div key={c.id} className="text-sm bg-gray-50 border rounded-xl px-3 py-2" dangerouslySetInnerHTML={{ __html: linkify(c.body) }} />
      ))}
      {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
    </div>
  );
}
