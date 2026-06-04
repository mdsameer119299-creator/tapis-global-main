/**
 * Fixes broken local dev (missing chunks, "missing required error components", wrong port).
 * Stops processes on ports 3000–3002 and removes the .next folder.
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = process.cwd()
const PORTS = [3000, 3001, 3002]

function rmNext() {
  try {
    fs.rmSync(path.join(root, '.next'), { recursive: true, force: true })
    console.log('Removed .next cache')
  } catch {
    // ignore
  }
}

function freePortsWindows() {
  for (const port of PORTS) {
    try {
      const out = execSync(
        `netstat -ano | findstr :${port}`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] },
      )
      const pids = new Set()
      for (const line of out.split('\n')) {
        const m = line.trim().match(/\s+(\d+)\s*$/);
        if (m) pids.add(m[1])
      }
      for (const pid of pids) {
        if (pid && pid !== '0') {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
            console.log(`Stopped process ${pid} on port ${port}`)
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // port not in use
    }
  }
}

if (process.platform === 'win32') {
  freePortsWindows()
} else {
  for (const port of PORTS) {
    try {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { shell: true, stdio: 'ignore' })
    } catch {
      // ignore
    }
  }
}

rmNext()
console.log('Dev environment reset. Run: npm run dev')
