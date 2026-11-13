require('./env');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { seed } = require('./src/seed');
const { requireAuth } = require('./src/auth');

seed();

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', 1); // set when running behind Render/Railway/nginx

const PROD = process.env.NODE_ENV === 'production';
app.use(helmet({
  hsts: PROD,
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      scriptSrcAttr: ["'none'"],
      ...(PROD ? { upgradeInsecureRequests: [] } : {}),
    },
  },
}));
app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));

// Basic CSRF defence on top of SameSite=Strict cookies: state-changing requests must come from our own origin.
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin) {
    let host;
    try { host = new URL(origin).host; } catch { host = null; }
    if (host !== req.get('host')) return res.status(403).json({ error: 'Cross-site request blocked.' });
  }
  next();
});

app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.use('/api/public', require('./src/routes/public'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin', requireAuth, require('./src/routes/admin'));
app.use('/api/teacher', requireAuth, require('./src/routes/teacher'));
app.use('/api/student', requireAuth, require('./src/routes/student'));
app.use('/api', require('./src/routes/shared'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));

// Errors (including upload errors) return JSON, never stack traces.
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File is too large (15 MB maximum).' });
  if (err && (err.name === 'MulterError' || err.message === 'This file type is not allowed.')) {
    return res.status(400).json({ error: err.message });
  }
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SUIT Cyber portal running on http://localhost:${port}`));
