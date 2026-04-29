# 🎯 HALL OF ACE

> **Different problems. Same shapes.**
>
> A daily field notebook on building, thinking, and the space between.

A premium full-stack blog with admin dashboard, Google login, comments, likes, and rich text editor. Built with Next.js + Supabase.

## ⚡ Quick start

```bash
npm install
cp .env.example .env.local  # then fill in your keys
npm run dev
```

**👉 For the full step-by-step setup (Supabase, Google OAuth, deployment) read [SETUP.md](./SETUP.md). This is the important file.**

## 🛠 What's inside

- **Public blog** — Bento-grid homepage, post pages, archive
- **Admin dashboard** at `/admin` (only your email can access)
- **Rich text editor** — TipTap-powered, with style presets (Editorial / Modern / Mono)
- **Google sign-in** for readers (optional — comments + likes require it)
- **Comments + likes** on every post
- **Image uploads** to Supabase storage
- **Draft → Publish workflow** with auto-save
- **Premium post toggle** (paywall-ready)
- **Monetization slots** — tip jar, ad slot, newsletter capture

## 🗂 Stack

- **Next.js 14** (App Router)
- **Supabase** (Postgres + Auth + Storage)
- **TipTap** (rich text editor)
- **TypeScript**

## 📁 Structure

```
halloface/
├── app/
│   ├── page.tsx              ← homepage
│   ├── login/                ← Google sign in
│   ├── blog/[slug]/          ← public post pages
│   ├── admin/                ← YOUR dashboard
│   │   ├── page.tsx          ← all posts list
│   │   ├── new/              ← write new post
│   │   └── edit/[id]/        ← edit existing
│   └── api/                  ← backend routes
├── components/               ← shared React components
├── lib/                      ← Supabase clients + auth helpers
├── supabase/
│   └── schema.sql            ← run this in Supabase SQL editor
├── SETUP.md                  ← READ THIS FIRST
└── README.md
```

## 🚀 Deploy

Push to GitHub → import on Vercel → add env vars → deploy. Free forever.

Full deploy guide in [SETUP.md](./SETUP.md).
