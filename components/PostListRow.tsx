'use client';
 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
 
type Post = {
  id: string;
  title: string;
  category: string;
  reading_time: string | null;
  updated_at: string;
  published: boolean;
  premium: boolean;
};
 
export default function PostListRow({ post }: { post: Post }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | 'toggle' | 'delete'>(null);
  // Optimistic state — update UI before server confirms
  const [published, setPublished] = useState(post.published);
 
  async function togglePublish() {
    if (busy) return;
    const next = !published;
 
    // Confirm only when going from published → unpublished
    if (!next) {
      const ok = confirm(
        `Unpublish "${post.title}"?\n\nThe post will be hidden from readers but kept as a draft. You can publish it again anytime.`
      );
      if (!ok) return;
    }
 
    setBusy('toggle');
    setPublished(next); // optimistic
 
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: next }),
    });
 
    if (!res.ok) {
      setPublished(!next); // revert
      const data = await res.json();
      alert('Failed: ' + (data.error || 'unknown error'));
    } else {
      router.refresh(); // re-fetch server data
    }
    setBusy(null);
  }
 
  async function handleDelete() {
    if (busy) return;
    const ok = confirm(
      `Delete "${post.title}" permanently?\n\nThis CANNOT be undone. All comments and likes on this post will also be deleted.`
    );
    if (!ok) return;
 
    // Second confirmation for published posts (extra safety)
    if (published) {
      const reallyOk = confirm(
        `This post is currently PUBLISHED. Are you absolutely sure you want to delete it forever?`
      );
      if (!reallyOk) return;
    }
 
    setBusy('delete');
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
 
    if (!res.ok) {
      const data = await res.json();
      alert('Delete failed: ' + (data.error || 'unknown error'));
      setBusy(null);
    } else {
      router.refresh();
    }
  }
 
  return (
    <div className="post-row" style={busy === 'delete' ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
      <div>
        <div className="title">{post.title || '(untitled)'}</div>
        <div className="meta">
          {post.category} · {post.reading_time || '— min'} ·
          {' '}Updated {format(new Date(post.updated_at), 'MMM d, h:mm a')}
        </div>
      </div>
 
      <span className={`status-pill ${published ? 'published' : 'draft'}`}>
        {published ? 'Published' : 'Draft'}
      </span>
 
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {/* Unpublish/Publish quick toggle */}
        <button
          onClick={togglePublish}
          disabled={!!busy}
          className="btn btn-ghost"
          title={published ? 'Unpublish (hide from readers)' : 'Publish now'}
          style={{ padding: '8px 12px', fontSize: 13 }}
        >
          {busy === 'toggle' ? '...' : published ? '👁 Unpublish' : '🚀 Publish'}
        </button>
 
        {/* Edit */}
        <Link
          href={`/admin/edit/${post.id}`}
          className="btn btn-ghost"
          style={{ padding: '8px 12px', fontSize: 13 }}
        >
          Edit
        </Link>
 
        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={!!busy}
          className="btn btn-danger"
          title="Delete permanently"
          style={{ padding: '8px 12px', fontSize: 13 }}
        >
          {busy === 'delete' ? '...' : '🗑'}
        </button>
      </div>
    </div>
  );
}
 