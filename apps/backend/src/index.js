import 'dotenv/config';   // ← must be first — loads .env into process.env
import express from 'express';
import cors from 'cors';
import connectDB from './config/Database.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import createOrgRoutes from './routes/createOrgRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // allow Vite dev server
app.use(express.json());                  // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);         // POST /api/auth/signup, etc.
app.use('/api/createorg', createOrgRoutes);         

// ── Start Server ─────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();