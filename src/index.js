import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import resourceRoutes from './modules/resources/resources.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '7mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'campus-cercetare-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Cererea este prea mare. Dimensiunea maximă a imaginii este 5 MB.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Cererea conține date JSON invalide.' });
  }
  next(err);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
