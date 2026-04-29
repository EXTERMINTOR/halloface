'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const isActive = (path: string) =>
    pathname === path ? 'active' : '';

  return (
    <aside className="admin-side">
      <h2><span className="logo-dot" /> Hall of Ace</h2>
      <span className="tag">// admin · uh-LACE</span>

      <nav className="admin-nav">
        <Link href="/admin" className={isActive('/admin')}>
          📋 All Posts
        </Link>
        <Link href="/admin/new" className={isActive('/admin/new')}>
          ✦ New Post
        </Link>
        <Link href="/" target="_blank">
          🌐 View site
        </Link>
      </nav>

      <button onClick={signOut} className="btn btn-ghost" style={{ width: '100%' }}>
        Sign out
      </button>
    </aside>
  );
}
