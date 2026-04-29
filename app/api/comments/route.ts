import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = await req.json();
  const { post_id, content } = body;
  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: 'post_id and content required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id,
      user_id: user.id,
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url || null,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}
