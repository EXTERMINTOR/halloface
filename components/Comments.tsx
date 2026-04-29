'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase-browser';

type Comment = {
  id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
};

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const res = await fetch(`/api/comments?post_id=${postId}`);
    const data = await res.json();
    setComments(data.comments || []);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, content: text }),
    });
    setSubmitting(false);
    if (res.ok) {
      setText('');
      refresh();
    } else {
      const e = await res.json();
      alert(e.error || 'Failed to post comment');
    }
  }

  return (
    <section className="comments-section">
      <h3>Discussion ({comments.length})</h3>

      {user ? (
        <form onSubmit={submit} className="comment-form">
          <textarea
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="comment-form-actions">
            <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-prompt">
          <p>Sign in to join the discussion.</p>
          <Link href="/login" className="btn btn-primary btn-large">Sign in with Google</Link>
        </div>
      )}

      <div>
        {comments.length === 0 ? (
          <p style={{ color: 'var(--ink-3)', textAlign: 'center', padding: '40px 0' }}>
            No comments yet. Be the first.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment">
              {c.user_avatar ? (
                <img src={c.user_avatar} alt={c.user_name} className="comment-avatar" />
              ) : (
                <div className="comment-avatar" />
              )}
              <div>
                <div className="comment-head">
                  <span className="name">{c.user_name}</span>
                  <span className="when">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                </div>
                <p className="comment-body">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
