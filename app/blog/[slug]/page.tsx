import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase-server';
import Comments from '@/components/Comments';
import LikeButton from '@/components/LikeButton';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();
  if (!post) return { title: 'Not found' };
  return {
    title: `${post.title} — Hall of Ace`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (error || !post) notFound();

  const html = post.content_html || '';
  const segments = html.split(/(?=<h2)/);
  const halfIndex = Math.max(1, Math.floor(segments.length / 2));
  const firstHalf = segments.slice(0, halfIndex).join('');
  const secondHalf = segments.slice(halfIndex).join('');

  return (
    <article>
      <header className="post-hero container">
        <Link href="/" className="post-back">← back to archive</Link>
        <span className="post-cat">{post.category}</span>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>{post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
          <span>·</span>
          <span>{post.reading_time}</span>
          <span>·</span>
          <span>By Wallace Noronha</span>
        </div>
      </header>

      <div className="container">
        <div className="post-content" dangerouslySetInnerHTML={{ __html: firstHalf }} />

        {secondHalf && (
          <>
            <div className="ad-slot">
              [ ad slot — replace with AdSense or affiliate banner once approved ]
            </div>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: secondHalf }} />
          </>
        )}

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <LikeButton postId={post.id} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
            Found this useful? Tap the heart.
          </span>
        </div>

        <div className="tip-card">
          <h3>Enjoyed this?</h3>
          <p>If this saved you time or made you think differently, consider buying me a coffee.</p>
          <div className="tip-buttons">
            <a href="https://buymeacoffee.com/your-handle" target="_blank" rel="noopener" className="tip-btn">
              ☕ Buy me a coffee
            </a>
            <a href="https://github.com/EXTERMINTOR" target="_blank" rel="noopener" className="tip-btn outline">
              ⭐ Star on GitHub
            </a>
          </div>
        </div>

        <Comments postId={post.id} />
      </div>
    </article>
  );
}
