'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Editor from './Editor';

type Props = {
  initialPost?: any;
  isEditing?: boolean;
};

const CATEGORIES = [
  'GENERAL',
  'BUILD LOG',
  'META',
  'TUTORIAL',
  'REFLECTION',
  'OPINION',
  'NOTES',
  'INTERVIEW',
];

export default function PostForm({ initialPost, isEditing = false }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [category, setCategory] = useState(initialPost?.category || 'GENERAL');
  const [premium, setPremium] = useState(!!initialPost?.premium);
  const [published, setPublished] = useState(!!initialPost?.published);
  const [content, setContent] = useState(initialPost?.content || { type: 'doc', content: [{ type: 'paragraph' }] });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save(asPublished: boolean) {
    if (!title.trim()) {
      alert('Please add a title before saving.');
      return;
    }
    setSaving(true);

    const payload = {
      title,
      excerpt,
      category,
      premium,
      published: asPublished,
      content,
    };

    let res;
    if (isEditing && initialPost?.id) {
      res = await fetch(`/api/posts/${initialPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      alert('Save failed: ' + (data.error || 'unknown'));
      return;
    }

    if (!isEditing && data.post?.id) {
      router.push(`/admin/edit/${data.post.id}`);
    } else {
      setSavedAt(new Date().toLocaleTimeString());
      setPublished(asPublished);
    }
  }

  async function handleDelete() {
    if (!isEditing || !initialPost?.id) return;
    if (!confirm('Delete this post permanently? This cannot be undone.')) return;
    const res = await fetch(`/api/posts/${initialPost.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin');
    } else {
      const data = await res.json();
      alert('Delete failed: ' + (data.error || 'unknown'));
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <span className="section-label">{isEditing ? 'Editing' : 'Drafting'}</span>
          <h1>{isEditing ? <>Edit <em>post.</em></> : <>New <em>post.</em></>}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {savedAt && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              ✓ Saved at {savedAt}
            </span>
          )}
        </div>
      </div>

      <div className="editor-wrap">
        <div className="editor-main">
          <input
            className="title-input"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Editor content={content} onChange={setContent} />
        </div>

        <aside className="editor-side">
          <h3>Post settings</h3>

          <div className="field">
            <label>Excerpt (optional)</label>
            <textarea
              placeholder="Auto-generated if blank..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Premium post</label>
            <div className="field-toggle" onClick={() => setPremium(!premium)}>
              <span style={{ fontSize: 14 }}>{premium ? 'Premium content' : 'Free for everyone'}</span>
              <span className={`toggle-switch ${premium ? 'on' : ''}`} />
            </div>
          </div>

          <div className="editor-actions">
            <button
              className="btn btn-ghost btn-large"
              onClick={() => save(false)}
              disabled={saving}
            >
              {saving ? 'Saving…' : '💾 Save draft'}
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={() => save(true)}
              disabled={saving}
            >
              {saving ? 'Saving…' : (published ? '✓ Update published' : '🚀 Publish')}
            </button>
            {isEditing && published && initialPost?.slug && (
              <a
                href={`/blog/${initialPost.slug}`}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost"
                style={{ textAlign: 'center' }}
              >
                View live →
              </a>
            )}
            {isEditing && (
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑 Delete
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
