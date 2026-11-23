import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';

const router = Router();

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    where: { email: { in: ['andrei.popescu@student.usv.ro', 'elena.rusu@usv.ro'] } },
  });
  res.json(users);
});

router.post('/login', async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_usv_key_2026',
    { expiresIn: '7d' }
  );

  res.json({ token, user });
});

export default router;
