import { createClient } from './supabase-server';

export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin() {
  const user = await getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: admin access required');
  }
}
