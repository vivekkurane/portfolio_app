# Vivekanand Kurane — Portfolio

Full-stack animated portfolio: **React + TypeScript + Vite** frontend, **Express** API for the contact form.

## Run it
```bash
npm install
npm run build && npm start        # production: http://localhost:3001
# or, for development with hot reload (two terminals):
npm run dev:server                # API on :3001
npm run dev                       # Vite on :5173 (proxies /api)
```

## Features
- Animated hero (typewriter, morphing photo frame, floating chips), scroll-reveal sections, count-up stats, tilt cards
- Light/dark theme (system default, persisted), scroll-spy nav, mobile menu, skip link
- Résumé download (`public/resume.pdf`)
- Contact form: shared client/server validation, honeypot spam trap, rate limiting (5/min/IP), messages saved to `data/messages.json`, optional SMTP email (see `.env.example`)
- Respects `prefers-reduced-motion`

## Edit your content
All text lives in `src/data.ts`. Replace `public/profile.jpg` and `public/resume.pdf` to update the photo and résumé.

## Tests
```bash
npm test                                            # unit + API (vitest, supertest)
npx playwright install chromium                     # first time only
npm run build && npm run test:e2e                   # real-browser end-to-end
npm run test:all                                    # everything
```

## Deploy
`docker build -t portfolio . && docker run -p 3001:3001 -v $PWD/data:/app/data portfolio`
(or any Node host: build, then `npm start`).

Alternatively, run with Docker Compose:
```bash
docker compose up --build
```
The app is available at `http://localhost:3001`; Compose stores contact messages in the persistent `portfolio-data` volume. Stop it with `docker compose down`.

https://portfolio-app-wizz.onrender.com
