'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { Button } from './Button';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Nav() {
  const path = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
  }, [path]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-bold">MedMeet</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Tab href="/" label="Feed" active={path === '/'} />
          <Tab href="/notes" label="Notes" active={path?.startsWith('/notes') ?? false} />
          <Tab href="/resources" label="Resources" active={path?.startsWith('/resources') ?? false} />
          <Tab href="/jobs" label="Jobs" active={path?.startsWith('/jobs') ?? false} />
          <Tab href="/orgs" label="Orgs" active={path?.startsWith('/orgs') ?? false} />
          <Tab href="/upload" label="Upload" active={path?.startsWith('/upload') ?? false} />
          <Tab href="/profile" label="Profile" active={path?.startsWith('/profile') ?? false} />
          <Tab href="/admin" label="Admin" active={path?.startsWith('/admin') ?? false} />
        </nav>
        <div>
          {email ? (
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); location.href='/' }}>Sign out</Button>
          ) : (
            <Link href="/profile"><Button>Sign in</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`px-3 py-2 rounded-lg hover:bg-gray-100 ${active?'text-brand-700 font-semibold':'text-gray-700'}`}>{label}</Link>;
}
