import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const supabase = createClient();
  const user = await getUser();

  const { count } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  let liked = false;
  if (user) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();
    liked = !!data;
  }
  return NextResponse.json({ count: count || 0, liked });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = await req.json();
  const { post_id } = body;
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const supabase = createClient();
  // Check if already liked, toggle
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', post_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
    const { count } = await supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', post_id);
    return NextResponse.json({ liked: false, count: count || 0 });
  } else {
    await supabase.from('likes').insert({ post_id, user_id: user.id });
    const { count } = await supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', post_id);
    return NextResponse.json({ liked: true, count: count || 0 });
  }
}
