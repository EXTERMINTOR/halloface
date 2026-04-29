import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import PostListRow from '@/components/PostListRow';
 
// Disable caching — admin always sees fresh data
export const dynamic = 'force-dynamic';
 
export default async function AdminHome() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false });
 
  const list = posts || [];
  const drafts = list.filter((p) => !p.published).length;
  const published = list.filter((p) => p.published).length;
 
  return (
    <>
      <div className="admin-head">
        <div>
          <span className="section-label">Dashboard</span>
          <h1>All <em>posts.</em></h1>
        </div>
        <Link href="/admin/new" className="btn btn-primary btn-large">
          ✦ New post
        </Link>
      </div>
 
      <div style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap' }}>
        <Stat label="Total" value={list.length} />
        <Stat label="Published" value={published} accent />
        <Stat label="Drafts" value={drafts} />
      </div>
 
      {list.length === 0 ? (
        <div className="empty">
          <h3>No posts yet.</h3>
          <p>Click "New Post" to write your first entry.</p>
        </div>
      ) : (
        <div className="post-list">
          {list.map((post) => (
            <PostListRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
 
function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 120,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '18px 22px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.2em',
        color: 'var(--ink-3)',
        textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 36,
        fontWeight: 600,
        marginTop: 6,
        color: accent ? 'var(--accent)' : 'var(--ink)',
      }}>{value}</div>
    </div>
  );
}
 
