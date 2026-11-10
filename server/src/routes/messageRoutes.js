import express from 'express';
import {
  sendMessage,
  getMessages,
  markConversationRead,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', sendMessage);
router.get('/:conversationId', getMessages);
router.put('/:conversationId/read', markConversationRead);

export default router;
