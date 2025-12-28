# TrailSafe — Client

Frontend built with Vue 3 + Vite (minimal demo).

Quick start:

```powershell
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000` by default.

Responsive behavior:

- Breakpoint: **900px** is used to switch between desktop and mobile layouts.
- Desktop: vertical left sidebar (`260px`) + content area to the right.
- Mobile: bottom navigation bar (height 72px); main content reserves the bottom area so it doesn't get covered by the nav.
