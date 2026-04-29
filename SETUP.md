# 🚀 HALL OF ACE — Setup Guide

A complete full-stack blog with admin dashboard, Google login, comments, and likes.

> **Total setup time: ~25 minutes** (one-time only)

---

## 📋 What you'll set up

1. ✅ Install dependencies (2 min)
2. ✅ Create Supabase account + project (5 min)
3. ✅ Run the database schema (1 min)
4. ✅ Create a Google OAuth app (10 min)
5. ✅ Connect Google to Supabase (2 min)
6. ✅ Configure environment variables (1 min)
7. ✅ Run locally (2 min)
8. ✅ Deploy to Vercel (when ready)

---

## STEP 1 — Install dependencies

```bash
cd halloface
npm install
```

This installs Next.js, Supabase, TipTap (the editor), and everything else.

---

## STEP 2 — Set up Supabase

Supabase is your database + authentication + file storage, all in one. **It's free** for projects of your size.

### 2.1 Create an account

1. Go to **<https://supabase.com>**
2. Sign up (use your GitHub account — easiest)
3. Click **"New Project"**
4. Fill in:
   - **Project name:** `hall-of-ace`
   - **Database password:** generate a strong one (save it somewhere — you won't need it often, but you do need it eventually)
   - **Region:** Pick the closest one to you (Mumbai/Singapore for India)
   - **Pricing plan:** Free
5. Click **"Create new project"** — takes about 2 minutes to provision

### 2.2 Grab your API keys

Once the project is ready:

1. In the left sidebar, click **Settings** (the gear icon)
2. Click **API**
3. You'll see three keys you need to copy. Open a notepad and save them:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" — looks like `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API Keys" → `anon` `public` (long string) |
| `SUPABASE_SERVICE_ROLE_KEY` | "Project API Keys" → `service_role` `secret` (long string) — **KEEP SECRET** |

---

## STEP 3 — Run the database schema

This creates all the tables (posts, comments, likes, profiles) with security rules.

1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **"+ New query"**
3. Open the file `supabase/schema.sql` from this project
4. **Copy ALL of it** and paste into the SQL editor
5. Click **"Run"** (bottom right)

You should see a green "Success. No rows returned" message.

### 3.1 Create the storage bucket for images

1. In Supabase, click **Storage** in the left sidebar
2. Click **"New bucket"**
3. Bucket name: `post-images`
4. **Make sure "Public bucket" is ON** ✅
5. Click "Save"

> The SQL script also tries to create this — if it errored on that line, this manual step covers it.

---

## STEP 4 — Set up Google OAuth (for sign-in)

This is the longest step. Google requires you to register your app before they let users sign in with Google.

### 4.1 Create a Google Cloud project

1. Go to **<https://console.cloud.google.com>**
2. At the top, click the project dropdown → **"New project"**
3. Project name: `hall-of-ace`
4. Click **Create**
5. Wait ~10 seconds, then make sure your new project is selected at the top

### 4.2 Configure the OAuth consent screen

1. In the left sidebar: **APIs & Services** → **OAuth consent screen**
2. **User Type:** External → Create
3. Fill in the required fields:
   - **App name:** Hall of Ace
   - **User support email:** your email
   - **Developer contact email:** your email
4. Click **"Save and continue"**
5. **Scopes** screen: just click **"Save and continue"** (skip)
6. **Test users:** click **"+ Add users"** → add **your own email** (the one you'll sign in with). This is required while the app is in "test" mode.
7. Click **"Save and continue"**
8. Click **"Back to dashboard"**

### 4.3 Create OAuth credentials

1. Left sidebar: **APIs & Services** → **Credentials**
2. Click **"+ Create credentials"** → **"OAuth client ID"**
3. **Application type:** Web application
4. **Name:** Hall of Ace Web
5. **Authorized JavaScript origins:** add these (one per line):
   ```
   http://localhost:3000
   https://YOUR-PROJECT.supabase.co
   ```
   (Replace `YOUR-PROJECT` with your actual Supabase project URL prefix)
6. **Authorized redirect URIs:** add this:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
7. Click **"Create"**

A popup shows your **Client ID** and **Client Secret**. **Copy both somewhere safe.**

### 4.4 Connect Google to Supabase

1. Back in **Supabase**, click **Authentication** in the sidebar
2. Click **Providers** tab
3. Find **Google** in the list, click to expand it
4. Toggle it **ON**
5. Paste your **Client ID** and **Client Secret** from Google
6. Click **"Save"**

7. While you're in Auth settings, go to **Authentication** → **URL Configuration** and set:
   - **Site URL:** `http://localhost:3000` (change to your Vercel URL after deploying)
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` (and later your prod domain too)

✅ Google sign-in is ready.

---

## STEP 5 — Configure environment variables

1. In your project folder, copy the example file:

```bash
cp .env.example .env.local
```

2. Open `.env.local` in your editor and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-key...
ADMIN_EMAIL=your-email@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **`ADMIN_EMAIL` is critical** — only this email can access `/admin`. Use the same Google account you'll sign in with.

---

## STEP 6 — Run it locally

```bash
npm run dev
```

Open **<http://localhost:3000>**

Try this flow:
1. Click **"Sign in"** (top right) → continue with Google → use your admin email
2. After signing in, you'll see a **"Dashboard"** link appear in the nav (only you see this — it's based on `ADMIN_EMAIL`)
3. Click **Dashboard** → **"+ New post"**
4. Write something. Click **"🚀 Publish"**
5. Go back to homepage — your post is live.

🎉 **You now have a fully functional blog with admin dashboard.**

---

## STEP 7 — Deploy to Vercel

Once it works locally:

1. Push the project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/EXTERMINTOR/halloface.git
   git push -u origin main
   ```

2. Go to **<https://vercel.com/new>**
3. Import your GitHub repo
4. Before clicking deploy: expand **"Environment Variables"** and add the same 5 vars from your `.env.local`. ⚠️ **Change `NEXT_PUBLIC_SITE_URL` to your future Vercel URL** (e.g. `https://halloface.vercel.app`)
5. Click **Deploy** — done in 30 seconds

### After deploying:
1. Go back to **Supabase** → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL** and **Redirect URLs**
3. Go back to **Google Cloud Console** → APIs & Services → Credentials → your OAuth client
4. Add your Vercel URL to **Authorized JavaScript origins** and `https://yourapp.vercel.app/auth/callback` to **Authorized redirect URIs**

---

## 📝 Daily writing flow

1. Go to **<https://yourdomain.com/admin>**
2. Click **"+ New Post"**
3. Write title, body. Use the toolbar for formatting.
4. Use **"Save draft"** if you want to come back later
5. Use **"🚀 Publish"** when ready
6. Done. Post is live instantly.

You can edit any post anytime, toggle premium, or delete it.

---

## 💡 The editor — what you can do

The toolbar has everything you need:

- **Block style dropdown** — Body / H1 / H2 / H3 / Quote / Code block. Each style uses the right font (Editorial Fraunces for headings/quotes, Modern Inter for body, Mono for code).
- **Bold, Italic, Underline, Strikethrough, Inline code**
- **Bullet list, Numbered list**
- **Link** — select text, click 🔗
- **Image upload** — click 🖼, pick a file, uploads to Supabase
- **Horizontal divider** — adds `<hr>` between sections
- **Undo / Redo**

Keyboard shortcuts: `Ctrl+B`, `Ctrl+I`, `Ctrl+U`, `Ctrl+Z`, `Ctrl+Shift+Z`.

---

## 💰 Monetization slots — already built in

| Feature | Where to enable |
|---------|------------------|
| **Tip jar (Buy Me a Coffee)** | Replace `your-handle` in `app/blog/[slug]/page.tsx` and `components/Footer.tsx` |
| **Mid-article ad slot** | In `app/blog/[slug]/page.tsx` — replace placeholder with AdSense `<ins>` tag |
| **Premium posts** | Toggle in admin while writing. (Currently shows full content; for true paywall you'd add Stripe — easy add later.) |
| **Email newsletter** | Add Buttondown/ConvertKit embed to `Footer.tsx` |

---

## 🐛 Troubleshooting

**"Database not connected yet" on homepage**
→ Your env vars aren't loading. Stop the server (Ctrl+C), check `.env.local` exists in the project root with the right values, then `npm run dev` again.

**"Not authorized" when visiting /admin**
→ Either you're not signed in, or `ADMIN_EMAIL` doesn't match your Google account. Make sure both lowercase. Restart server after changing `.env.local`.

**Google sign-in redirects but doesn't sign me in**
→ Check that the redirect URL in Google Console matches **exactly** what Supabase shows. Watch out for trailing slashes.

**Image upload fails**
→ Make sure the `post-images` bucket in Supabase Storage exists and is set to **public**.

**"Sign in with Google" — "Access blocked"**
→ Your Google OAuth app is in "test" mode. Either: (a) add the email you're trying to use as a Test User in Google Console → OAuth consent screen, OR (b) submit your app for verification (Google will review — needed for production).

---

## 🎯 Next moves once it's live

1. **Set up custom domain** — buy `hallofa.ce` or `halloface.com` from Porkbun/Namecheap, point it at Vercel
2. **Apply for AdSense** once you have ~20 posts (`Settings` → AdSense will take a few weeks to approve)
3. **Add Stripe paywall** for premium subs (I can help with this in another session)
4. **Add Plausible/Google Analytics** for traffic tracking
5. **Submit sitemap to Google Search Console** (helps SEO)

---

## Questions? Stuck?

Each step has been tested. If something doesn't work, the issue is almost always:
- A typo in `.env.local`
- A redirect URL not matching exactly
- The dev server not being restarted after env var changes

Restart, double-check, try again. You got this.
