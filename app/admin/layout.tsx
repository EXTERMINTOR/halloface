import { redirect } from 'next/navigation';
import { isAdmin, getUser } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin — Hall of Ace',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login?next=/admin');

  const admin = await isAdmin();
  if (!admin) {
    return (
      <section className="login-shell">
        <div className="login-card">
          <h1>Not <em>authorized.</em></h1>
          <p>This dashboard is for the site owner only. If that's you, make sure you're signed in with the right Google account, and that <code>ADMIN_EMAIL</code> matches in the env config.</p>
          <a href="/" className="google-btn">Back to site</a>
        </div>
      </section>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
  );
}
