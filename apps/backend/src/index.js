import 'dotenv/config';   // ← must be first — loads .env into process.env
import express from 'express';
import cors from 'cors';
import connectDB from './config/Database.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import createOrgRoutes from './routes/createOrgRoutes.js'
import dashBoardRoutes from './routes/dashBoardRoutes.js'
import sectionRoutes from './routes/sectionRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
// Only the Vite dev server needs CORS. In production the app and the API share one domain.
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());                  // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ── Database ──────────────────────────────────────────────
// Vercel has no long-running server, so connect on the first request and reuse
// that connection for as long as this function instance stays warm.
let dbReady;
app.use(async (req, res, next) => {
  try {
    dbReady ??= connectDB();
    await dbReady;
    next();
  } catch (err) {
    dbReady = undefined;                  // try again on the next request
    next(err);
  }
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);         // POST /api/auth/signup, etc.
app.use('/api/createorg', createOrgRoutes);
app.use('/api/dashboard', dashBoardRoutes);
app.use('/api/dashboard/organizations', sectionRoutes);

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', message: 'Server error' });
});

// ── Start Server (local only) ────────────────────────────
// On Vercel the exported app is used directly, so we must not call listen().
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;