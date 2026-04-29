import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { isAdmin, getUser } from '@/lib/auth';
import { tiptapToHtml, extractPlainText } from '@/lib/tiptap-to-html';
import slugify from 'slugify';
import readingTime from 'reading-time';

export async function GET() {
  const supabase = createClient();
  const admin = await isAdmin();
  // Admin sees all; everyone else sees only published
  const query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  const { data, error } = admin ? await query : await query.eq('published', true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, category, premium, published, cover_image } = body;

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  // Slug from title; ensure uniqueness with timestamp suffix if collides
  const baseSlug = slugify(title, { lower: true, strict: true });
  const supabase = createClient();
  let slug = baseSlug;
  const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug).maybeSingle();
  if (existing) slug = `${baseSlug}-${Date.now().toString(36)}`;

  // Render HTML and reading time
  const contentHtml = tiptapToHtml(content);
  const plainText = extractPlainText(content);
  const stats = readingTime(plainText);

  // Auto excerpt if missing
  const finalExcerpt = excerpt?.trim() || (plainText.slice(0, 160) + (plainText.length > 160 ? '…' : ''));

  const { data, error } = await supabase
    .from('posts')
    .insert({
      slug,
      title,
      content,
      content_html: contentHtml,
      excerpt: finalExcerpt,
      category: category || 'GENERAL',
      premium: !!premium,
      published: !!published,
      published_at: published ? new Date().toISOString() : null,
      cover_image: cover_image || null,
      reading_time: stats.text,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}
