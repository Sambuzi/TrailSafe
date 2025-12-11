# TrailSafe — Server

Simple Express server with a minimal API for initial development.

Quick start:

1. Copy `.env.example` to `.env` and set `MONGODB_URI` if you want MongoDB.
2. Install dependencies and run:

```powershell
cd server
npm install
npm run dev
```

API endpoints:
- `GET /api/status` — health check
- `GET /api/trails` — list sample trails
- `POST /api/trails/report` — submit a report (sample)
