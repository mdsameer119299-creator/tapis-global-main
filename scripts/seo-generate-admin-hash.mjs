#!/usr/bin/env node
// Generates the values for the SEO Command Centre's isolated Preview login. Needs only Node 18+ (no npm install).
//
//   node seo-generate-admin-hash.mjs            prompts for a password (hidden) and prints SEO_ADMIN_PASSWORD_HASH
//   node seo-generate-admin-hash.mjs --secret   prints a random SEO_SESSION_SECRET
//
// The password is read locally, never printed, never sent anywhere. Only the one-way hash is output.
import { randomBytes, scryptSync } from 'node:crypto'

const N = 16384, R = 8, P = 1

if (process.argv.includes('--secret')) {
  console.log(randomBytes(48).toString('base64url'))
  process.exit(0)
}

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin
    if (!stdin.isTTY) {
      // Non-interactive (tests/pipes): read one line.
      let buf = ''
      stdin.setEncoding('utf8')
      stdin.on('data', (d) => (buf += d))
      stdin.on('end', () => resolve(buf.split(/\r?\n/)[0] ?? ''))
      return
    }
    process.stderr.write(prompt)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let value = ''
    const onData = (ch) => {
      for (const c of ch) {
        if (c === '\u0003') { stdin.setRawMode(false); process.stderr.write('\n'); reject(new Error('cancelled')); return }
        if (c === '\r' || c === '\n' || c === '\u0004') {
          stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', onData)
          process.stderr.write('\n'); resolve(value); return
        }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1)
        else value += c
      }
    }
    stdin.on('data', onData)
  })
}

try {
  const first = await readHidden('New SEO admin password (min 12 characters): ')
  if (first.length < 12) { console.error('Password must be at least 12 characters.'); process.exit(1) }
  if (process.stdin.isTTY) {
    const again = await readHidden('Repeat password: ')
    if (again !== first) { console.error('Passwords do not match.'); process.exit(1) }
  }
  const salt = randomBytes(16)
  const hash = scryptSync(first.normalize('NFKC'), salt, 32, { N, r: R, p: P, maxmem: 128 * 1024 * 1024 })
  console.log(`scrypt:${N}:${R}:${P}:${salt.toString('hex')}:${hash.toString('hex')}`)
  console.error('\nCopy the line above into Vercel as SEO_ADMIN_PASSWORD_HASH (Preview only, mark Sensitive).')
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
}
