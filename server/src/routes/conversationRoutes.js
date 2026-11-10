import express from 'express';
import {
  accessChat,
  createGroup,
  getConversations,
  getConversation,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getConversations).post(accessChat);
router.post('/group', createGroup);
router.get('/:id', getConversation);
router.put('/:id/rename', renameGroup);
router.put('/:id/add', addToGroup);
router.put('/:id/remove', removeFromGroup);

export default router;
