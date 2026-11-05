import { chromium } from '@playwright/test'
const out = process.argv[2]
const pages = process.argv.slice(3)
const browser = await chromium.launch()
for (const spec of pages) {
  const [path, w] = spec.split('@')
  const width = Number(w || 1440)
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: 'reduce' })
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle', timeout: 120000 })
  for (let y = 0; y < 20000; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120) }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800)
  const name = (path === '/' ? 'home' : path.replace(/\//g, '_')) + '_' + width
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true })
  console.log(name)
  await page.close()
}
await browser.close()
