/**
 * Batch-convert public/images PNG/JPG to WebP with sensible max dimensions.
 * Run: npm run optimize:images
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '../public/images')

/** Max width by filename pattern */
function maxWidthFor(filename) {
  if (/^tgi-banner-\d+\.(png|jpe?g)$/i.test(filename)) return 1920
  if (/^collection-/.test(filename)) return 1200
  if (/^solutions-/.test(filename)) return 1200
  if (/^rug\d+\.jpe?g$/i.test(filename)) return 1200
  if (/videoframe/.test(filename)) return 1400
  return 1600
}

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null

  const base = path.basename(filePath, ext)
  const outPath = path.join(IMAGES_DIR, `${base}.webp`)
  const maxW = maxWidthFor(path.basename(filePath))

  const buf = await sharp(filePath)
    .rotate()
    .resize(maxW, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 82, effort: 4 })
    .toBuffer()

  fs.writeFileSync(outPath, buf)
  const inKb = (fs.statSync(filePath).size / 1024).toFixed(1)
  const outKb = (buf.length / 1024).toFixed(1)
  return { base, inKb, outKb }
}

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f))
  console.log(`Converting ${files.length} images…\n`)

  let saved = 0
  for (const file of files) {
    const result = await convertFile(path.join(IMAGES_DIR, file))
    if (result) {
      saved += parseFloat(result.inKb) - parseFloat(result.outKb)
      console.log(`✓ ${file} → ${result.base}.webp (${result.inKb}KB → ${result.outKb}KB)`)
    }
  }

  // Remove dead banner PNGs (code uses .webp only)
  const deadBanners = files.filter((f) => /^tgi-banner-[1-6]\.png$/i.test(f))
  for (const file of deadBanners) {
    fs.unlinkSync(path.join(IMAGES_DIR, file))
    console.log(`🗑 deleted unused ${file}`)
  }

  // Remove originals after successful WebP conversion (keep only .webp in /public/images)
  for (const file of files) {
    if (/^tgi-banner-[1-6]\.png$/i.test(file)) continue // already deleted above
    const srcPath = path.join(IMAGES_DIR, file)
    const webpPath = path.join(IMAGES_DIR, `${path.basename(file, path.extname(file))}.webp`)
    if (fs.existsSync(webpPath)) {
      fs.unlinkSync(srcPath)
      console.log(`🗑 deleted original ${file}`)
    }
  }

  console.log(`\nDone. Approx saved: ${saved.toFixed(0)} KB from conversions + dead banners removed.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
