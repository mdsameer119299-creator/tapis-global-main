/** Clear dev/build cache — fixes Windows ENOENT and missing chunk errors */
const fs = require('fs')
const path = require('path')

const root = process.cwd()

function rm(rel) {
  try {
    fs.rmSync(path.join(root, rel), { recursive: true, force: true })
  } catch {
    // ignore
  }
}

// Webpack cache dirs that corrupt most often
rm('.next/cache/webpack')
rm('.next/cache/client-development-fallback')
rm('.next/cache/server-development')
