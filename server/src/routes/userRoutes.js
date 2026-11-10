import express from 'express';
import { searchUsers, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/search', searchUsers);
router.patch('/profile', updateProfile);

export default router;
