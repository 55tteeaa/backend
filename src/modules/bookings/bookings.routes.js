import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  getResourceSlots,
  createBooking,
  getMyBookings,
  deleteBooking,
  getAdminRequests,
  updateBookingStatus,
} from './bookings.controller.js';

const router = Router();

router.get('/resource/:resourceId', getResourceSlots);
router.post('/', authenticate, createBooking);
router.get('/me', authenticate, getMyBookings);
router.delete('/:id', authenticate, deleteBooking);

router.get('/admin', authenticate, requireAdmin, getAdminRequests);
router.patch('/:id/status', authenticate, requireAdmin, updateBookingStatus);

export default router;
