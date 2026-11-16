import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token lipsă sau invalid.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_usv_key_2026');
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'Utilizator inexistent.' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Autentificare eșuată.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acces permis doar administratorilor de resurse.' });
  }
  next();
};
