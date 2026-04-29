import { NextResponse } from 'next/server';
import { getUser, isAdmin } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ user: null, isAdmin: false });
  const admin = await isAdmin();
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.user_metadata?.name },
    isAdmin: admin,
  });
}
