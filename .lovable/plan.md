

## Redesign Plan: Modern Gen-Z Ashe MUN

### What Changes

**1. Typography overhaul**
- Replace Cormorant Garamond / Exo 2 / DM Sans with **Space Grotesk** (headings — geometric, bold, techy) and **Inter** (body — clean, modern, universal Gen-Z favorite)
- Update Google Fonts link in `index.html`, font families in `tailwind.config.ts`, and base styles in `index.css`

**2. Stats strip → Countdown timer**
- Remove the `50+ Schools` stat entirely
- Replace the stats section with a live countdown to **August 15, 2026** showing Days / Hours / Minutes / Seconds
- Title above: "Countdown to Ashe MUN 2026"
- Large monospaced-style numbers in individual glass cards with labels below each unit
- Updates every second via `useEffect` + `setInterval`

**3. Visual modernization (all pages)**
- Slightly warmer accent palette: shift primary to a vibrant electric blue (`#6366F1` indigo-ish) or keep steel blue but add a neon cyan accent (`#22D3EE`) for hover states and glows — more Gen-Z energy
- Add gradient text effects on hero headings (blue → cyan gradient)
- Rounder corners on cards (`rounded-2xl`), bigger padding, more whitespace
- Bolder hover effects: scale-up + border glow transitions on cards
- Pill-shaped buttons with larger padding and subtle gradient backgrounds
- Replace thin gold dividers with gradient lines (blue → cyan → transparent)
- Add subtle noise/grain texture overlay on hero sections for depth

**4. Navbar modernization**
- Pill-shaped nav links container with a translucent background
- Active link gets a filled pill highlight
- Rounder CTA button with gradient fill

**5. Feature cards refresh**
- Icon inside a colored circle/rounded-square background
- Bolder titles, shorter descriptions
- Hover: card lifts with shadow + border color shift

**6. Footer refresh**
- Cleaner minimal layout, gradient top border (blue→cyan), social icons in pill row

**7. Secondary pages (About, Committees, Gallery)**
- Apply same typography and color updates
- Cards get the same rounded, spacious treatment
- Committee difficulty badges get filled pill style instead of outline-only

### Files Modified
- `index.html` — swap Google Fonts
- `src/index.css` — update base font rules, utility classes, accent colors
- `tailwind.config.ts` — new font families, updated color tokens
- `src/pages/Index.tsx` — remove Schools stat, add Countdown component, gradient heading, updated card styles
- `src/components/Navbar.tsx` — pill nav, gradient CTA
- `src/components/Footer.tsx` — modernized layout
- `src/components/Marquee.tsx` — updated accent color
- `src/components/PageHero.tsx` — gradient text, updated typography
- `src/pages/About.tsx` — typography + card styling
- `src/pages/Committees.tsx` — typography + card styling
- `src/pages/Gallery.tsx` — typography + filter pill styling

