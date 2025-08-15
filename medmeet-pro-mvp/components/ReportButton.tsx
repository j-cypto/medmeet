'use client';
import { supabase } from '@/lib/supabaseClient';

export default function ReportButton({ targetType, targetId }: { targetType: 'post'|'note'|'resource'|'job', targetId: string }) {
  async function report() {
    const reason = prompt('Reason for report?');
    if (!reason) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('reports').insert({ reporter_id: user?.id || null, target_type: targetType, target_id: targetId, reason });
    alert('Reported, thank you.');
  }
  return <button onClick={report} className="text-xs text-red-600 underline">Report</button>;
}
