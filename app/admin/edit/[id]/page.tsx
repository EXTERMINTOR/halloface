import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import PostForm from '@/components/PostForm';

export default async function EditPost({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !post) notFound();

  return <PostForm initialPost={post} isEditing />;
}
