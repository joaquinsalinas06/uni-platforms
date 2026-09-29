#!/usr/bin/env node
// Capturas HEADLESS. Nunca abre una ventana de navegador: el usuario está
// usando su pantalla. Sustituye a chrome-devtools MCP para los agentes.
//
//   node scripts/shot.mjs <ruta> [--out f.png] [--full] [--w 1440] [--dark]
//   node scripts/shot.mjs /structures/binary-heap/operations/max-heapify --out /tmp/a.png
//
// Imprime en stdout un informe JSON: errores de consola, peticiones fallidas,
// número de <figure>/<svg> y su tamaño. Si `figuras` es 0 en una página que
// debería tener diagrama, es que NO se está renderizando.
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const ruta = args.find((a) => !a.startsWith('--')) ?? '/';
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1] ?? true;
};
const base = flag('base', 'http://localhost:4321');
const out = flag('out', '/tmp/shot.png');
const width = Number(flag('w', 1440));
const full = args.includes('--full');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width, height: Number(flag('h', 900)) },
  colorScheme: args.includes('--dark') ? 'dark' : 'light',
});

const errors = [];
const failed = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on('requestfailed', (r) => failed.push(`${r.method()} ${r.url().slice(-60)}`));

const resp = await page.goto(base + ruta, { waitUntil: 'networkidle', timeout: 30000 });

// Las visualizaciones son islas `client:visible`: hay que recorrer la página
// para que se hidraten antes de medir o capturar.
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(700);

const info = await page.evaluate(() => {
  const figs = [...document.querySelectorAll('figure')].map((f) => {
    const r = f.getBoundingClientRect();
    return { alto: Math.round(r.height), ancho: Math.round(r.width), nodos: f.querySelectorAll('g').length };
  });
  const fuera = [...document.querySelectorAll('svg text')].filter((t) => {
    const box = t.closest('g')?.querySelector('rect');
    if (!box) return false;
    return t.getComputedTextLength?.() > box.getBBox().width;
  }).length;
  return {
    figuras: figs.length,
    figs,
    svg: document.querySelectorAll('svg').length,
    textoDesbordado: fuera,
    scrollH: document.body.scrollHeight,
    katex: document.querySelectorAll('.katex').length,
  };
});

await page.screenshot({ path: out, fullPage: full });
await browser.close();

console.log(JSON.stringify({ ruta, http: resp?.status(), out, ...info, errores: errors.slice(0, 5), peticionesFallidas: failed.slice(0, 5) }, null, 1));
