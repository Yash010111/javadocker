# StockPulse Frontend

A Vite + React frontend for your Spring Boot stock trading backend.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## App routes

- `/` → login/register page
- `/home` → user dashboard
- `/admin` → admin panel
- `*` → 404 page

## Backend

The frontend is configured to use the live backend:
`https://proud-wholeness-production-fc22.up.railway.app`

## Notes

- Stores JWT, username, and roles in `localStorage`
- Sends `Authorization: Bearer <token>` for protected requests
- Handles `401`, `403`, `404`, `400`, and `500` responses with user-friendly messages
