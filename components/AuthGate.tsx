'use client';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session)=> setUser(session?.user ?? null));
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  if (!ready) return <div className="text-center py-10">Loading...</div>;
  if (!user) return <AuthForm />;
  return <>{children}</>;
}

function AuthForm() {
  async function signIn(e: any) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email') as string;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/profile' } });
    alert(error ? error.message : 'Check your email for a sign-in link.');
  }
  return (
    <form onSubmit={signIn} className="card max-w-md mx-auto p-6 text-center space-y-4">
      <h2 className="text-2xl font-bold">Welcome to MedMeet</h2>
      <p className="text-gray-600">Sign in with a magic link (no password needed)</p>
      <input className="w-full border rounded-xl px-3 py-2" type="email" name="email" placeholder="you@example.com" required />
      <button className="w-full bg-brand-600 text-white py-2 rounded-xl font-semibold hover:bg-brand-700">Send magic link</button>
    </form>
  );
}
