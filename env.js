// Tiny .env loader (no dependency). Lines like KEY=value. Real environment variables win.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '.env');
if (fs.existsSync(f)) {
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i.exec(line);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
