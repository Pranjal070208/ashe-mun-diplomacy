## Changes

### 1. Social icons (Footer + Index Contact)
- Replace the 4-icon array `[Instagram, Twitter, Linkedin, Youtube]` in `src/components/Footer.tsx` and `src/pages/Index.tsx` with a single Instagram link → `https://www.instagram.com/ashemun.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==` (target `_blank`, `rel="noreferrer noopener"`).
- Drop Twitter/Linkedin/Youtube imports.

### 2. Footer Support column
- Remove the `FAQ` and `Delegate Resources` `<span>` entries in `src/components/Footer.tsx`, keep `Email Us`.

### 3. Contact phone numbers (`src/pages/Index.tsx`)
- Replace the single phone row with two rows:
  - `+91 9569303507 — Arnav Awasthi`
  - `+91 9044793344 — Shivam Ahuja`
- Keep email row unchanged.

### 4. Hide Gallery everywhere
- Remove the `Gallery` entry from `navLinks` in `src/components/Navbar.tsx`.
- Remove the Gallery link from `src/components/Footer.tsx`.
- Remove the `<Route path="/gallery">` and `Gallery` import in `src/App.tsx`.
- Delete `src/pages/Gallery.tsx`.
- Remove the `/gallery` URL from `public/sitemap.xml`.
- Remove the Gallery line from `public/llms.txt`.

### 5. URL change `abcxyzmun.lovable.app` → `ashemun.com`
Update in:
- `index.html` (og:url, JSON-LD url fields, Organization/WebSite urls, logo URL).
- `src/components/SEO.tsx` (`SITE_URL`).
- `public/sitemap.xml` (all `<loc>`).
- `public/robots.txt` (Sitemap directive).

### 6. Dates change Aug 15–17, 2026 → June 24–25, 2026
Update in:
- `public/llms.txt` (replace "August 15–17, 2026").
- `index.html` JSON-LD: `startDate: "2026-06-24"`, `endDate: "2026-06-25"`.
- `src/pages/Index.tsx`:
  - Countdown target → `new Date("2026-06-24T00:00:00").getTime()`.
  - Hero pill text `August 15–17, 2026` → `June 24–25, 2026`.
  - SEO `title` and `<h1>` sr-only text → `June 24–25, 2026`.

### 7. Stats counters (`src/pages/Index.tsx`)
- Change Committees from `8` → `7`.
- Change Days from `3` → `2`.

### 8. Committees page top padding (desktop)
- Navbar is fixed (height `h-24 md:h-28` ≈ 112px). On desktop, `.ashe-bars-area` currently has `padding: 24px 40px 32px`, so the top of the bars sits behind the navbar (see attachment).
- Update desktop padding in `src/pages/Committees.tsx` to `padding: 140px 40px 32px` (clears 112px navbar + breathing room). Mobile padding stays at `96px 12px 28px`.

### Files touched
- `src/components/Footer.tsx`
- `src/components/Navbar.tsx`
- `src/components/SEO.tsx`
- `src/pages/Index.tsx`
- `src/pages/Committees.tsx`
- `src/App.tsx`
- `src/pages/Gallery.tsx` (deleted)
- `index.html`
- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`
