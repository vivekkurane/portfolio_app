import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import { DATA_FILE } from '../../playwright.config';

const good = { name: 'Asha Rao', email: 'asha@example.com', message: 'Hi Vivek, loved your portfolio — let’s talk!' };
const fill = async (p: Page, v = good) => {
  await p.getByLabel('Name').fill(v.name);
  await p.getByLabel('Email').fill(v.email);
  await p.getByLabel('Message').fill(v.message);
};
const stored = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

test.beforeAll(() => fs.rmSync(DATA_FILE, { force: true }));

test.describe('page content', () => {
  test('workflow demo supports selection and keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: '03 Review' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('Keep people in the loop.');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: '04 Execute' })).toBeFocused();
    await expect(page.getByRole('tabpanel')).toContainText('Turn a plan into an outcome.');
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(page.getByRole('tab', { name: '01 Map' })).toHaveAttribute('aria-selected', 'true');
  });

  test('renders hero, portrait and loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page).toHaveTitle(/Vivekanand Kurane/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vivekanand Kurane');
    const img = page.getByAltText(/Portrait of Vivekanand/);
    await expect(img).toBeVisible();
    expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('typewriter cycles through role phrases', async ({ page }) => {
    await page.goto('/');
    const typed = page.getByTestId('typed');
    await expect(typed).not.toHaveText('');
    await expect(typed).toHaveText(/^(agentic AI platforms|LangGraph pipelines)/, { timeout: 8000 });
  });

  test('stat counters animate to their final values', async ({ page }) => {
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('stat')).toHaveText(['5+', '75%', '10+', '14'], { timeout: 5000 });
  });

  test('experience, projects, skills and extras are all present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('job')).toHaveCount(2);
    await expect(page.getByTestId('job').first()).toContainText('Deloitte');
    await expect(page.getByTestId('job').nth(1)).toContainText('Tata Consultancy Services');
    await expect(page.getByTestId('project')).toHaveCount(3);
    for (const n of ['SAGE', 'RDD – Renewal Due Diligence', 'MMortgage']) await expect(page.getByRole('heading', { name: n })).toBeAttached();
    await expect(page.getByTestId('skill-group')).toHaveCount(4);
    for (const h of ['Certifications', 'Awards · TCS-CIBC', 'Education']) await expect(page.getByRole('heading', { name: h })).toBeAttached();
  });

  test('scroll reveal makes off-screen sections visible', async ({ page }) => {
    await page.goto('/');
    const card = page.getByTestId('job').first();
    await expect(card).not.toHaveClass(/\bin\b/);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/\bin\b/);
    await expect(card).toHaveCSS('opacity', '1');
  });

  test('project card tilts on hover and resets on leave', async ({ page }) => {
    await page.goto('/');
    const card = page.getByTestId('project').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('opacity', '1');
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2);
    await expect.poll(() => card.evaluate((e) => (e as HTMLElement).style.transform)).toContain('rotateY');
    await page.mouse.move(2, 2);
    await expect.poll(() => card.evaluate((e) => (e as HTMLElement).style.transform)).toBe('');
  });
});

test.describe('navigation & theme', () => {
  test('nav links scroll to sections and highlight the active one', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    for (const [label, id] of [['Experience', 'exp'], ['Projects', 'work'], ['Skills', 'skills'], ['Contact', 'contact']]) {
      await page.getByTestId('nav-links').getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
      await expect(page.getByTestId('nav-links').getByRole('link', { name: label })).toHaveClass(/active/);
    }
  });

  test('theme toggle switches, persists across reload, and toggles back', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(lightBg);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('follows the system dark preference on first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('unknown routes fall back to the app, unknown API routes return JSON 404', async ({ page, request }) => {
    await page.goto('/some/deep/link');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vivekanand');
    const res = await request.get('/api/nope');
    expect(res.status()).toBe(404);
    expect((await res.json()).ok).toBe(false);
  });
});

test.describe('links & résumé', () => {
  test('contact links are correct', async ({ page }) => {
    await page.goto('/');
    const c = page.locator('#contact');
    await expect(c.getByRole('link', { name: 'vivekkurane90@gmail.com' })).toHaveAttribute('href', 'mailto:vivekkurane90@gmail.com');
    await expect(c.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/vivekanand-kurane-47732a207');
    await expect(c.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', /noopener/);
  });

  test('résumé downloads as a real PDF', async ({ page, request }) => {
    await page.goto('/');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('resume').click()]);
    expect(dl.suggestedFilename()).toBe('Vivekanand_Kurane_Resume.pdf');
    const res = await request.get('/resume.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
    expect((await res.body()).subarray(0, 4).toString()).toBe('%PDF');
  });
});

test.describe('contact form', () => {
  test('shows validation errors for empty and invalid input, clears them on typing', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('alert')).toHaveCount(3);
    await page.getByLabel('Name').fill('Asha');
    await expect(page.locator('#name-err')).toHaveCount(0);
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Message').fill('Hello there friend');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('#email-err')).toContainText('valid email');
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(fs.existsSync(DATA_FILE)).toBe(false);
  });

  test('live character counter', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByLabel('Message').fill('12345');
    await expect(page.getByText('5/2000')).toBeVisible();
  });

  test('submits for real: success state, form reset, message persisted by the API', async ({ page }) => {
    await page.goto('/#contact');
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByTestId('form-success')).toContainText('Message sent');
    const saved = stored();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject(good);
    await page.getByRole('button', { name: 'Send another' }).click();
    await expect(page.getByLabel('Name')).toHaveValue('');
    await expect(page.getByLabel('Message')).toHaveValue('');
  });

  test('disables the button while sending', async ({ page }) => {
    await page.route('**/api/contact', async (r) => { await new Promise((x) => setTimeout(x, 600)); r.fulfill({ status: 201, json: { ok: true } }); });
    await page.goto('/#contact');
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await expect(page.getByTestId('form-success')).toBeVisible();
  });

  test('shows server errors and keeps what the user typed', async ({ page }) => {
    await page.route('**/api/contact', (r) => r.fulfill({ status: 500, json: { ok: false, error: 'Could not send your message. Please email me directly.' } }));
    await page.goto('/#contact');
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByTestId('form-error')).toContainText('Could not send');
    await expect(page.getByLabel('Name')).toHaveValue(good.name);
  });

  test('shows the rate-limit message on 429', async ({ page }) => {
    await page.route('**/api/contact', (r) => r.fulfill({ status: 429, json: { ok: false, error: 'Too many messages. Please try again in a minute.' } }));
    await page.goto('/#contact');
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByTestId('form-error')).toContainText('Too many messages');
  });

  test('handles a network failure and recovers on retry', async ({ page }) => {
    await page.route('**/api/contact', (r) => r.abort());
    await page.goto('/#contact');
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByTestId('form-error')).toContainText('Network error');
    await page.unroute('**/api/contact');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByTestId('form-success')).toBeVisible();
  });

  test('honeypot field is hidden from users and ignored by the API', async ({ page, request }) => {
    await page.goto('/#contact');
    await expect(page.locator('input[name="website"]')).not.toBeInViewport();
    const before = stored().length;
    const res = await request.post('/api/contact', { data: { ...good, website: 'spam' } });
    expect(res.status()).toBe(200);
    expect(stored()).toHaveLength(before);
  });
});

test.describe('accessibility & motion', () => {
  test('reduced motion: content visible immediately, counters final, no typing delay', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('typed')).toHaveText('agentic AI platforms');
    await expect(page.getByTestId('stat')).toHaveText(['5+', '75%', '10+', '14']);
    await expect(page.getByTestId('job').first()).toHaveCSS('opacity', '1');
  });

  test('skip link and keyboard focus work', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('no horizontal overflow, burger menu opens, navigates and closes', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const links = page.getByTestId('nav-links');
    await expect(links).toBeHidden();
    await page.getByTestId('burger').click();
    await expect(links).toBeVisible();
    await links.getByRole('link', { name: 'Projects' }).click();
    await expect(links).toBeHidden();
    await expect(page.locator('#work')).toBeInViewport();
  });

  test('contact form is usable on mobile', async ({ page }) => {
    await page.goto('/#contact');
    await fill(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByTestId('form-success')).toBeVisible();
  });
});
