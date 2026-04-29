import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase-server';

export const revalidate = 60; // refresh from DB every 60s

export default async function Home() {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, category, premium, published_at, reading_time')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const list = posts || [];
  const [featured, ...rest] = list;
  const recent = rest.slice(0, 6);

  return (
    <>
      <section className="hero container">
        <div className="hero-eyebrow fade-in">
          ◆ Daily field notes — Issue {String(list.length || 1).padStart(3, '0')}
        </div>
        <h1 className="hero-title fade-in">
          Different problems.<br />
          <span className="accent">Same shapes.</span>
        </h1>
        <p className="hero-sub fade-in">
          A daily field notebook on building, thinking, and the space between.
          One developer. One notebook. Patterns across disciplines, written down.
        </p>
        <div className="hero-meta fade-in">
          <span>by <b>Wallace Noronha</b></span>
          <span>· Updated <b>daily</b></span>
          <span>· <b>{list.length}</b> {list.length === 1 ? 'entry' : 'entries'}</span>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="section-label">Filed under</span>
            <h2 className="section-title">The <em>archive.</em></h2>
          </div>
        </div>

        {error && (
          <div className="empty">
            <h3>Database not connected yet.</h3>
            <p>Follow the SETUP.md guide to connect Supabase. Once connected, posts will appear here.</p>
          </div>
        )}

        {!error && list.length === 0 && (
          <div className="empty">
            <h3>First post coming soon.</h3>
            <p>Sign in as the admin to write your first post.</p>
          </div>
        )}

        {!error && list.length > 0 && (
          <div className="bento">
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="card featured fade-in">
                {featured.premium && <span className="premium-badge">★ Premium</span>}
                <span className="card-cat">{featured.category} — Featured</span>
                <h3 className="card-title">{featured.title}</h3>
                <p className="card-excerpt">{featured.excerpt}</p>
                <div className="card-foot">
                  <span>{featured.published_at && format(new Date(featured.published_at), 'MMM dd, yyyy')} · {featured.reading_time}</span>
                  <span className="card-arrow">→</span>
                </div>
              </Link>
            )}
            {recent.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card regular fade-in">
                {post.premium && <span className="premium-badge">★ Premium</span>}
                <span className="card-cat">{post.category}</span>
                <h3 className="card-title">{post.title}</h3>
                <p className="card-excerpt">{post.excerpt}</p>
                <div className="card-foot">
                  <span>{post.published_at && format(new Date(post.published_at), 'MMM dd')} · {post.reading_time}</span>
                  <span className="card-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
