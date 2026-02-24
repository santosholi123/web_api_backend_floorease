import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// POST /api/admin/login
router.post('/login', (req, res, next) => adminController.login(req, res, next));

export default router;
//