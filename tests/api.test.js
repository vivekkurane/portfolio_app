import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.js';

const good = { name: 'Asha Rao', email: 'asha@example.com', message: 'Hello, I would like to talk.' };
let dir, dataFile, distDir;
const read = async () => JSON.parse(await fs.readFile(dataFile, 'utf8'));
const make = (opts = {}) => createApp({ dataFile, distDir, rateLimit: { max: 100, windowMs: 60000 }, ...opts });

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pf-'));
  dataFile = path.join(dir, 'data', 'messages.json');
  distDir = path.join(dir, 'dist');
  await fs.mkdir(distDir);
  await fs.writeFile(path.join(distDir, 'index.html'), '<html>SPA</html>');
});
afterEach(() => fs.rm(dir, { recursive: true, force: true }));

describe('POST /api/contact', () => {
  it('stores a valid message (creating the data dir) and returns 201 with an id', async () => {
    const res = await request(make()).post('/api/contact').send(good);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    const saved = await read();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ ...good, id: res.body.id });
    expect(new Date(saved[0].createdAt).toString()).not.toBe('Invalid Date');
  });
  it('returns 400 with per-field errors and stores nothing', async () => {
    const res = await request(make()).post('/api/contact').send({ name: 'A', email: 'bad', message: 'hi' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(['email', 'message', 'name']);
    await expect(fs.access(dataFile)).rejects.toThrow();
  });
  it('silently accepts honeypot submissions without storing them', async () => {
    const res = await request(make()).post('/api/contact').send({ ...good, website: 'http://spam.example' });
    expect(res.status).toBe(200);
    await expect(fs.access(dataFile)).rejects.toThrow();
  });
  it('rate limits after the configured maximum', async () => {
    const app = make({ rateLimit: { max: 2, windowMs: 60000 } });
    expect((await request(app).post('/api/contact').send(good)).status).toBe(201);
    expect((await request(app).post('/api/contact').send(good)).status).toBe(201);
    const res = await request(app).post('/api/contact').send(good);
    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
  });
  it('rejects oversized and malformed bodies', async () => {
    const big = await request(make()).post('/api/contact').send({ ...good, message: 'x'.repeat(30000) });
    expect(big.status).toBe(413);
    const bad = await request(make()).post('/api/contact').set('Content-Type', 'application/json').send('{nope');
    expect(bad.status).toBe(400);
  });
  it('does not lose messages under concurrent writes', async () => {
    const app = make();
    const res = await Promise.all(Array.from({ length: 15 }, (_, i) => request(app).post('/api/contact').send({ ...good, name: `User ${i}` })));
    expect(res.every((r) => r.status === 201)).toBe(true);
    expect(new Set((await read()).map((m) => m.id)).size).toBe(15);
  });
  it('calls the mailer, and still succeeds if the mailer fails', async () => {
    const send = vi.fn().mockResolvedValue();
    await request(make({ mailer: { send } })).post('/api/contact').send(good).expect(201);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ email: good.email }));
    const failing = { send: vi.fn().mockRejectedValue(new Error('smtp down')) };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await request(make({ mailer: failing })).post('/api/contact').send(good).expect(201);
  });
  it('returns 500 when storage fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await fs.writeFile(path.join(dir, 'blocker'), 'x');
    const res = await request(make({ dataFile: path.join(dir, 'blocker', 'm.json') })).post('/api/contact').send(good);
    expect(res.status).toBe(500);
    expect(res.body.ok).toBe(false);
  });
});

describe('other routes', () => {
  it('health check', async () => {
    expect((await request(make()).get('/api/health')).body).toEqual({ ok: true });
  });
  it('unknown /api routes 404 as JSON; other paths fall back to the SPA', async () => {
    const api = await request(make()).get('/api/nope');
    expect(api.status).toBe(404);
    expect(api.body.ok).toBe(false);
    const spa = await request(make()).get('/some/deep/link');
    expect(spa.status).toBe(200);
    expect(spa.text).toContain('SPA');
  });
  it('sets security headers and hides x-powered-by', async () => {
    const res = await request(make()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
