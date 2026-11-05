// Shrinks the photos downloaded from WordPress to web-friendly WebP files.
// Usage: node scripts/prepare-images.mjs   (reads scripts/wp-export/media, writes scripts/wp-export/optimized)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'scripts/wp-export/media'
const OUT = 'scripts/wp-export/optimized'
fs.mkdirSync(OUT, { recursive: true })

const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g)$/i.test(f))
let before = 0
let after = 0
for (const f of files) {
  const src = path.join(SRC, f)
  const name = f.replace(/-scaled/, '').replace(/-e\d{10,}/, '').replace(/\.(jpe?g)$/i, '.webp')
  const out = path.join(OUT, name)
  const isHero = f.startsWith('1N5A9960')
  await sharp(src)
    .rotate()
    .resize({ width: isHero ? 2400 : 2000, withoutEnlargement: true })
    .webp({ quality: isHero ? 82 : 78, effort: 5 })
    .toFile(out)
  before += fs.statSync(src).size
  after += fs.statSync(out).size
}
console.log(`${files.length} images: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB`)
