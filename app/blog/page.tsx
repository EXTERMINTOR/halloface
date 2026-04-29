import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase-server';

export const revalidate = 60;

export const metadata = {
  title: 'Archive — Hall of Ace',
};

export default async function BlogIndex() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, category, published_at, reading_time')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const list = posts || [];

  return (
    <section className="container" style={{ paddingTop: 80, paddingBottom: 100 }}>
      <span className="section-label">Index</span>
      <h1 className="section-title" style={{ marginBottom: 60 }}>The full <em>archive.</em></h1>

      {list.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet.</h3>
          <p>The first post drops soon.</p>
        </div>
      ) : (
        <div>
          {list.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 100px',
                gap: 32,
                padding: '32px 0',
                borderBottom: '1px solid var(--border)',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                {post.published_at && format(new Date(post.published_at), 'MMM dd, yyyy')}
              </span>
              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 8,
                }}>
                  {post.category}
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(20px, 2.5vw, 28px)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  color: 'var(--ink)',
                }}>
                  {post.title}
                </h2>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>
                {post.reading_time}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
