import { Router } from 'express';
import { getResources, getResourceById } from './resources.controller.js';

const router = Router();
router.get('/', getResources);
router.get('/:id', getResourceById);

export default router;
