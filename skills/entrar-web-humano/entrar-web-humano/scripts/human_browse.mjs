import { chromium } from 'playwright';
import os from 'os';
import path from 'path';

const log = (...a) => console.error(...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a));
const profileDir = path.join(os.homedir(), '.car-scrape-profile');

// Movimiento de ratón en pasos + micro-scroll, como un humano
async function humanize(page, seconds = 6) {
  const end = Date.now() + seconds * 1000;
  let x = rnd(200, 900), y = rnd(150, 500);
  while (Date.now() < end) {
    const nx = Math.max(5, Math.min(1300, x + rnd(-120, 120)));
    const ny = Math.max(5, Math.min(800, y + rnd(-90, 90)));
    const steps = rnd(6, 18);
    await page.mouse.move(nx, ny, { steps });
    x = nx; y = ny;
    if (Math.random() < 0.5) await page.mouse.wheel(0, rnd(120, 480));
    await sleep(rnd(180, 620));
  }
}

const ctx = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  channel: undefined, // Chromium empaquetado (no hay Chrome real)
  viewport: { width: 1366, height: 830 },
  locale: 'es-ES',
  timezoneId: 'Europe/Madrid',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  args: [
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    '--disable-features=IsolateOrigins,site-per-process',
    // Forzar IPv4 en los dominios de coches.net (DataDome desconfía de la IPv6 de DIGI)
    '--host-resolver-rules=MAP www.coches.net 3.174.170.77, MAP coches.net 65.8.202.121',
  ],
});

// Parches de sigilo (anti-DataDome fingerprinting)
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'languages', { get: () => ['es-ES', 'es', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = { runtime: {}, app: {}, csi: () => {}, loadTimes: () => {} };
  const orig = navigator.permissions.query.bind(navigator.permissions);
  navigator.permissions.query = p => p && p.name === 'notifications'
    ? Promise.resolve({ state: Notification.permission }) : orig(p);
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
});

const page = ctx.pages()[0] || await ctx.newPage();

async function blocked() {
  const t = (await page.title()).toLowerCase();
  const b = (await page.evaluate(() => document.body?.innerText || '')).toLowerCase();
  return /verweigert|access denied|un bot|no va bien|blocked|forbidden|captcha/.test(t + ' ' + b);
}

try {
  log('1) home coches.net (calentando perfil)…');
  await page.goto('https://www.coches.net/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(rnd(1500, 3000));
  for (const sel of ['#didomi-notice-agree-button', 'button:has-text("Aceptar")', 'button:has-text("Acepto")']) {
    try { await page.click(sel, { timeout: 3000 }); log('cookies aceptadas'); break; } catch {}
  }
  await humanize(page, rnd(5, 9));

  // 2) navegar a segunda mano y dejar que DataDome asiente su cookie
  log('2) segunda-mano…');
  await page.goto('https://www.coches.net/segunda-mano/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(rnd(1500, 2800));
  await humanize(page, rnd(6, 10));

  // 3) listado filtrado Cayenne (varios reintentos con comportamiento humano)
  const target = 'https://www.coches.net/porsche-cayenne-ocasion/';
  let ok = false;
  for (let i = 1; i <= 4 && !ok; i++) {
    log(`3) intento ${i} → ${target}`);
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(rnd(2500, 4500));
    await humanize(page, rnd(6, 11));
    if (await blocked()) { log('   bloqueado, reintento tras pausa humana'); await sleep(rnd(3000, 6000)); continue; }
    ok = true;
  }
  await page.screenshot({ path: '/tmp/human_coches.png' });
  const data = await page.evaluate(() => {
    const txt = document.body.innerText.replace(/\s+/g, ' ');
    const count = (txt.match(/([\d.]+)\s+(Coches|resultados|anuncios)/i) || [])[0] || null;
    const cards = [];
    document.querySelectorAll('a[href*="-covo.aspx"], a[href*="/porsche-cayenne"]').forEach(a => {
      const card = a.closest('article') || a.closest('div');
      const t = (card?.innerText || '').replace(/\s+/g, ' ').trim();
      if (/cayenne/i.test(t) && /€/.test(t)) cards.push({ url: a.href.split('?')[0], t: t.slice(0, 160) });
    });
    const seen = new Set();
    return { blocked: /un bot|no va bien|access denied/i.test(txt), count, cards: cards.filter(c => !seen.has(c.url) && seen.add(c.url)).slice(0, 30) };
  });
  log('RESULT blocked:', data.blocked, 'count:', data.count, 'cards:', data.cards.length);
  console.log(JSON.stringify(data, null, 2));
} catch (e) {
  log('ERR', e.message);
} finally {
  await sleep(1500);
  await ctx.close();
}
