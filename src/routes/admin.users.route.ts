import { Router } from 'express';
import { adminUsersController } from '../controllers/admin.users.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminOnlyMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.use(authMiddleware, adminOnlyMiddleware);

// GET /api/admin/users
router.get('/', (req, res, next) => adminUsersController.listUsers(req, res, next));

// GET /api/admin/users/:id
router.get('/:id', (req, res, next) => adminUsersController.getUser(req, res, next));

// PUT /api/admin/users/:id
router.put('/:id', (req, res, next) => adminUsersController.updateUser(req, res, next));

// DELETE /api/admin/users/:id
router.delete('/:id', (req, res, next) => adminUsersController.deleteUser(req, res, next));

export default router;
//