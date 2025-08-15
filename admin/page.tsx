'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Report } from '@/lib/types';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(()=>{ (async ()=>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: admin } = await supabase.from('admin_users').select('*').eq('user_id', user.id);
    setIsAdmin((admin||[]).length > 0);
    await loadReports();
  })(); }, []);

  async function loadReports() {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(200);
    setReports((data||[]) as any);
  }

  async function setHidden(target_type: string, target_id: string, hidden: boolean) {
    const table = ({ post:'posts', note:'notes', resource:'resources', job:'jobs' } as any)[target_type];
    if (!table) return;
    await supabase.from(table).update({ hidden }).eq('id', target_id);
    alert(hidden? 'Content hidden' : 'Content restored');
  }

  async function resolveReport(id: string) {
    await supabase.from('reports').update({ resolved: true }).eq('id', id);
    loadReports();
  }

  if (!isAdmin) return <div className="text-sm text-gray-600">You are not an admin.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin — Reports</h1>
      <div className="grid gap-3">
        {reports.map(r => (
          <div key={r.id} className="card p-4 space-y-2">
            <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
            <div className="font-semibold">{r.target_type} • {r.target_id}</div>
            <div className="text-gray-800">{r.reason}</div>
            <div className="flex gap-2">
              <button onClick={()=>setHidden(r.target_type, r.target_id, true)} className="px-3 py-1 rounded-xl bg-red-600 text-white">Hide</button>
              <button onClick={()=>setHidden(r.target_type, r.target_id, false)} className="px-3 py-1 rounded-xl bg-gray-800 text-white">Restore</button>
              <button onClick={()=>resolveReport(r.id)} className="px-3 py-1 rounded-xl bg-brand-600 text-white">Resolve</button>
            </div>
          </div>
        ))}
        {reports.length===0 && <div className="text-gray-600">No reports.</div>}
      </div>
    </div>
  );
}
