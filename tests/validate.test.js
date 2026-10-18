import { describe, it, expect } from 'vitest';
import { validateContact, LIMITS } from '../shared/validate.js';

const ok = { name: 'Asha Rao', email: 'asha@example.com', message: 'Hello, I would like to talk.' };

describe('validateContact', () => {
  it('accepts a valid payload and trims values', () => {
    const r = validateContact({ name: '  Asha ', email: ' asha@example.com ', message: '  Hello there friend  ' });
    expect(r.valid).toBe(true);
    expect(r.values).toEqual({ name: 'Asha', email: 'asha@example.com', message: 'Hello there friend' });
  });
  it('rejects empty input with an error per field', () => {
    const r = validateContact({});
    expect(r.valid).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name']);
  });
  it.each(['plain', 'a@b', 'a b@c.com', '@x.com', 'a@.com'])('rejects bad email %s', (email) => {
    expect(validateContact({ ...ok, email }).errors.email).toBeTruthy();
  });
  it('enforces length limits', () => {
    expect(validateContact({ ...ok, name: 'x'.repeat(LIMITS.name + 1) }).errors.name).toBeTruthy();
    expect(validateContact({ ...ok, message: 'x'.repeat(LIMITS.message + 1) }).errors.message).toBeTruthy();
    expect(validateContact({ ...ok, message: 'short' }).errors.message).toBeTruthy();
  });
  it('treats whitespace-only fields as empty and tolerates non-strings', () => {
    expect(validateContact({ ...ok, name: '   ' }).errors.name).toBeTruthy();
    expect(validateContact({ name: 5, email: null, message: {} }).valid).toBe(false);
  });
});
