/**
 * Replace /images/*.png|jpg references with .webp in source files.
 * Run after optimize-images.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKIP = new Set(['node_modules', '.next', '.git', 'public/logos'])

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (/\.(tsx?|json|webmanifest|mjs)$/.test(ent.name)) files.push(p)
  }
  return files
}

const RE = /\/images\/([a-zA-Z0-9_-]+)\.(png|jpe?g)/g
let count = 0

for (const file of walk(ROOT)) {
  if (file.includes('replace-image-paths.mjs')) continue
  let src = fs.readFileSync(file, 'utf8')
  const next = src.replace(RE, '/images/$1.webp')
  if (next !== src) {
    fs.writeFileSync(file, next)
    count++
    console.log('updated', path.relative(ROOT, file))
  }
}

console.log(`\n${count} files updated.`)
