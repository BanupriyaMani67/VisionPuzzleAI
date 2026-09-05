 # VisionPuzzle AI

VisionPuzzle AI is a full-stack hand gesture puzzle game. It uses browser camera access, MediaPipe Hands, Canvas, Express, and SQLite.

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and set a long `SESSION_SECRET`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000` and allow camera access on the game screen.

The backend initializes the SQLite database automatically. Camera access requires localhost or HTTPS, plus a supported browser and permission.

## Architecture

`backend/server.js` exposes session-authenticated REST endpoints and serves the static frontend. `backend/database/schema.sql` defines users, games, achievements, and indexes. The frontend is plain HTML, CSS, and JavaScript; MediaPipe Hands runs in the browser and feeds landmarks into gesture recognition and the Canvas puzzle engine.

## API

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
User: `GET/PUT /api/user/profile`.
Games: `POST /api/games`, `GET /api/games/history`, `GET /api/games/stats`.
Other: `GET /api/leaderboard`, `GET /api/achievements`.

## Troubleshooting

If the camera is blocked, check browser site permissions and use localhost. If the server will not start, remove `node_modules` and the lockfile, reinstall, and verify Node.js is supported by `better-sqlite3`. The app reports API and MediaPipe failures in the interface.
