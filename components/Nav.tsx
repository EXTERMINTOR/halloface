'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      checkAdmin(data.user?.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user?.email);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAdmin(email?: string | null) {
    if (!email) { setIsAdmin(false); return; }
    // Calls a tiny API endpoint to check (we don't expose ADMIN_EMAIL client-side)
    try {
      const res = await fetch('/api/whoami');
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch { setIsAdmin(false); }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const avatar = user?.user_metadata?.avatar_url;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-dot" />
          HALL OF ACE
        </Link>
        <ul className="nav-links">
          <li><Link href="/">Latest</Link></li>
          <li><Link href="/blog">Archive</Link></li>
          {isAdmin && <li><Link href="/admin" style={{ color: 'var(--accent)' }}>Dashboard</Link></li>}
        </ul>
        <div className="nav-right">
          {user ? (
            <>
              {avatar ? (
                <img src={avatar} alt="profile" className="nav-avatar" onClick={handleSignOut} title="Click to sign out" />
              ) : (
                <button onClick={handleSignOut} className="nav-cta" style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}>
                  Sign out
                </button>
              )}
            </>
          ) : (
            <Link href="/login" className="nav-cta">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
