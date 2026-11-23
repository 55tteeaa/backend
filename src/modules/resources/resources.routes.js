import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  getResources,
  getResourceById,
  getResourceImage,
  uploadResourceImage,
  createResource,
  updateResource,
  deleteResource,
} from './resources.controller.js';

const router = Router();
router.get('/', getResources);
router.post('/', authenticate, requireAdmin, createResource);
router.get('/:id/image', getResourceImage);
router.put('/:id/image', authenticate, requireAdmin, uploadResourceImage);
router.put('/:id', authenticate, requireAdmin, updateResource);
router.delete('/:id', authenticate, requireAdmin, deleteResource);
router.get('/:id', getResourceById);

export default router;
