import express from 'express';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateContact } from '../shared/validate.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export function createApp({
  dataFile = path.join(here, '../data/messages.json'),
  distDir = path.join(here, '../dist'),
  mailer = null,
  rateLimit = { max: 5, windowMs: 60_000 },
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '20kb' }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Serialised JSON-file store so parallel requests never clobber each other.
  let queue = Promise.resolve();
  const save = (rec) => {
    const run = queue.then(async () => {
      let list = [];
      try { list = JSON.parse(await fs.readFile(dataFile, 'utf8')); } catch { /* first write */ }
      list.push(rec);
      await fs.mkdir(path.dirname(dataFile), { recursive: true });
      await fs.writeFile(dataFile, JSON.stringify(list, null, 2));
    });
    queue = run.catch(() => {});
    return run;
  };

  const hits = new Map();
  const limiter = (req, res, next) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) || []).filter((t) => now - t < rateLimit.windowMs);
    if (recent.length >= rateLimit.max)
      return res.status(429).json({ ok: false, error: 'Too many messages. Please try again in a minute.' });
    recent.push(now);
    hits.set(req.ip, recent);
    next();
  };

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.post('/api/contact', limiter, async (req, res) => {
    const body = req.body || {};
    if (body.website) return res.json({ ok: true }); // honeypot: pretend success, store nothing
    const { valid, errors, values } = validateContact(body);
    if (!valid) return res.status(400).json({ ok: false, errors });
    const record = { id: randomUUID(), ...values, createdAt: new Date().toISOString() };
    try {
      await save(record);
    } catch (err) {
      console.error('save failed', err);
      return res.status(500).json({ ok: false, error: 'Could not send your message. Please email me directly.' });
    }
    if (mailer) mailer.send(record).catch((err) => console.error('mail failed', err.message));
    res.status(201).json({ ok: true, id: record.id });
  });

  app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));
  app.use((err, _req, res, next) => {
    if (err?.type === 'entity.too.large') return res.status(413).json({ ok: false, error: 'Message too large.' });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ ok: false, error: 'Invalid JSON.' });
    next(err);
  });

  app.use(express.static(distDir, { maxAge: '1h', index: 'index.html' }));
  app.use((_req, res) => {
    const index = path.join(distDir, 'index.html');
    existsSync(index) ? res.sendFile(index) : res.status(404).send('Build the app first: npm run build');
  });
  return app;
}
