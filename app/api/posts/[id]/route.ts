import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { isAdmin, getUser } from '@/lib/auth';
import { tiptapToHtml, extractPlainText } from '@/lib/tiptap-to-html';
import readingTime from 'reading-time';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from('posts').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ post: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = createClient();

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) updates.title = body.title;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
  if (body.category !== undefined) updates.category = body.category;
  if (body.premium !== undefined) updates.premium = !!body.premium;
  if (body.cover_image !== undefined) updates.cover_image = body.cover_image;

  if (body.content !== undefined) {
    updates.content = body.content;
    updates.content_html = tiptapToHtml(body.content);
    const plain = extractPlainText(body.content);
    const stats = readingTime(plain);
    updates.reading_time = stats.text;
    if (!body.excerpt) {
      updates.excerpt = plain.slice(0, 160) + (plain.length > 160 ? '…' : '');
    }
  }

  if (body.published !== undefined) {
    updates.published = !!body.published;
    if (body.published) {
      // Set published_at only if not already published
      const { data: existing } = await supabase
        .from('posts')
        .select('published_at, published')
        .eq('id', params.id)
        .single();
      if (!existing?.published || !existing?.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient();
  const { error } = await supabase.from('posts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
