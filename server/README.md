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
- `POST /api/ai/ai-search` — semantic search: body `{ query: string }` returns top matching trails (uses Gemini when `USE_GEMINI=1`, otherwise OpenAI embeddings)

Authentication endpoints:
- `POST /api/auth/register` — register (body: `email`, `password`, optional `name`)
- `POST /api/auth/login` — login (body: `email`, `password`)

Environment variables (see `.env.example`):
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWT tokens
- `GEMINI_API_KEY` — (optional) API key for Google's Gemini / Generative AI. If provided, you can enable Gemini ranking below.
- `USE_GEMINI` — set to `1` to use Gemini for semantic ranking of trails from the AI Explore page (fallback to OpenAI embeddings if not set).

If `MONGODB_URI` is not set the server will run with in-memory sample data; when connected to MongoDB the server uses Mongoose models for `User`, `Trail`, and `Report`.
