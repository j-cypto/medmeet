# MedMeet Pro (MVP+)

This build adds all the requested features on top of the base MVP:
- **Reels UX polish**: auto‑play, swipe up/down, mute toggle
- **Social**: follows, comments, likes, @mentions, #hashtags
- **Notes**: upvotes, tags, user collections
- **Resources**: reviews with star ratings + comments; aggregated average
- **Organizations**: org profiles; org members
- **Jobs**: manual postings + **job feed registry** and **JSON paste importer** (easy path now; cron later)
- **Moderation**: report button + **Admin dashboard** to hide/restore content and resolve reports
- **Notifications**: user preference table for **daily email digest** (hook to Vercel Cron + email service)

## 1) Supabase Setup

1) Create project → **SQL Editor** → run `supabase/schema.sql`  
2) **Storage**: create public buckets: `videos`, `notes`, `avatars` (add public read policies).  
3) **Project Settings → API**: copy URL and anon key to env vars.

## 2) Env Vars

Create `.env.local` (local) or add on Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3) Run

```
npm install
npm run dev
```

## 4) Deploy

Deploy on Vercel; add the two env vars.

## 5) Admin Access

Insert your user into `admin_users` after you sign in once and know your UUID:
```sql
insert into admin_users (user_id) values ('YOUR-AUTH-UID');
```
Then open `/admin` to review reports & hide/restore content.

## 6) Job Feeds

For now, add feed URLs at **Jobs → Add Job Feed URL**, and use the **Manual Import** box to paste a JSON array of jobs.  
To automate, wire a **Vercel Cron** hitting an API route that fetches feeds and inserts into `jobs` (simple `fetch(...)` → `supabase.from('jobs').insert(...)`).

## 7) Email Digests / Push

- Email: Use Vercel Cron daily → query recent top posts/resources and send via your email provider (Postmark/SendGrid). Users opt in via `/profile` (table: `notification_settings`).  
- Push: Add a service worker + web-push (e.g., OneSignal) and store subscription endpoints per user.

## 8) Notes

- Mentions and hashtags are linkified on display. Use `#tag` and `@handle` in titles/descriptions.  
- Reel auto-play triggers only on the active card; wheel/touch navigation switches reels.  
- RLS ensures users can only update their own rows; admins can moderate across the app.

---

Enjoy shipping! 🎉
