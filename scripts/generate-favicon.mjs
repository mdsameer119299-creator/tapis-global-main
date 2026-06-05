/**
 * Generates transparent TG monogram favicons (Google-style: logo only, no box).
 * Run: npm run favicon
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SOURCE = path.join(ROOT, 'public/logos/tgi-monogram-source.png')
const OUT_DIR = path.join(ROOT, 'public/logos')
const APP_DIR = path.join(ROOT, 'app')

const SIZES = {
  'favicon-16.png': 16,
  'favicon-32.png': 32,
  'favicon-48.png': 48,
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512,
}

/** Transparent square master — monogram fills ~82% of canvas */
async function buildMaster(size = 512) {
  const meta = await sharp(SOURCE).metadata()
  const cropSize = Math.min(meta.width ?? 902, meta.height ?? 902)

  let cropped = sharp(SOURCE).extract({ left: 0, top: 0, width: cropSize, height: cropSize })

  try {
    cropped = sharp(await cropped.trim({ threshold: 18 }).toBuffer())
  } catch {
    cropped = sharp(
      await sharp(SOURCE)
        .extract({ left: 0, top: 0, width: cropSize, height: cropSize })
        .toBuffer(),
    )
  }

  const trimmedMeta = await cropped.metadata()
  const pad = Math.round(Math.max(trimmedMeta.width, trimmedMeta.height) * 0.09)
  const innerSize = size - pad * 2

  const logo = await cropped
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function writeIco(pngBuffers, outPath) {
  const images = pngBuffers.map(({ size, buffer }) => ({ size, buffer }))
  const count = images.length

  const headerSize = 6 + count * 16
  let offset = headerSize
  const entries = []

  for (const { size, buffer } of images) {
    entries.push({ size, buffer, offset })
    offset += buffer.length
  }

  const totalSize = offset
  const out = Buffer.alloc(totalSize)

  out.writeUInt16LE(0, 0)
  out.writeUInt16LE(1, 2)
  out.writeUInt16LE(count, 4)

  let entryOffset = 6
  for (const { size, buffer, offset: dataOffset } of entries) {
    const dim = size >= 256 ? 0 : size
    out[entryOffset] = dim
    out[entryOffset + 1] = dim
    out.writeUInt8(0, entryOffset + 2)
    out.writeUInt8(0, entryOffset + 3)
    out.writeUInt16LE(1, entryOffset + 4)
    out.writeUInt16LE(32, entryOffset + 6)
    out.writeUInt32LE(buffer.length, entryOffset + 8)
    out.writeUInt32LE(dataOffset, entryOffset + 12)
    entryOffset += 16
  }

  let dataOffset = headerSize
  for (const { buffer } of entries) {
    buffer.copy(out, dataOffset)
    dataOffset += buffer.length
  }

  fs.writeFileSync(outPath, out)
}

async function pngToIcoBuffer(pngBuffer) {
  if (pngBuffer.length < 24 || pngBuffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Invalid PNG for ICO')
  }
  const width = pngBuffer.readUInt32BE(16)
  const height = pngBuffer.readUInt32BE(20)
  const header = Buffer.alloc(40)
  header.writeUInt32LE(40, 0)
  header.writeInt32LE(width, 4)
  header.writeInt32LE(height * 2, 8)
  header.writeUInt16LE(1, 12)
  header.writeUInt16LE(32, 14)
  header.writeUInt32LE(0, 16)
  header.writeUInt32LE(pngBuffer.length, 20)
  header.writeUInt32LE(22, 24)
  return Buffer.concat([header, pngBuffer])
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Source logo missing:', SOURCE)
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const master512 = await buildMaster(512)

  for (const [filename, px] of Object.entries(SIZES)) {
    const outPath = path.join(OUT_DIR, filename)
    await sharp(master512).resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(outPath)
    console.log('✓', filename)
  }

  const icoSizes = [16, 32, 48]
  const icoParts = await Promise.all(
    icoSizes.map(async (px) => ({
      size: px,
      buffer: await pngToIcoBuffer(
        await sharp(master512)
          .resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
      ),
    })),
  )
  await writeIco(icoParts, path.join(OUT_DIR, 'favicon.ico'))
  console.log('✓ favicon.ico')

  await sharp(master512).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(APP_DIR, 'icon.png'))
  await sharp(master512).resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(APP_DIR, 'apple-icon.png'))
  console.log('✓ app/icon.png')
  console.log('✓ app/apple-icon.png')

  await sharp(master512).toFile(path.join(OUT_DIR, 'tgi-favicon-master.png'))
  console.log('Done — transparent monogram favicons.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
