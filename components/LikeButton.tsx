'use client';

import { useEffect, useState } from 'react';

export default function LikeButton({ postId }: { postId: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/likes?post_id=${postId}`).then((r) => r.json()).then((data) => {
      setCount(data.count || 0);
      setLiked(!!data.liked);
    });
  }, [postId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId }),
    });
    setLoading(false);
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    setCount(data.count);
    setLiked(data.liked);
  }

  return (
    <button onClick={toggle} className={`like-btn ${liked ? 'liked' : ''}`}>
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
