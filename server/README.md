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

Authentication endpoints:
- `POST /api/auth/register` — register (body: `email`, `password`, optional `name`)
- `POST /api/auth/login` — login (body: `email`, `password`)

Environment variables (see `.env.example`):
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWT tokens

If `MONGODB_URI` is not set the server will run with in-memory sample data; when connected to MongoDB the server uses Mongoose models for `User`, `Trail`, and `Report`.
