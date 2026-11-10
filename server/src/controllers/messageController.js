import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { assertParticipant } from '../utils/conversationAccess.js';
import { createMessage } from '../services/messageService.js';

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;

  const { message } = await createMessage({
    conversationId,
    senderId: req.user._id,
    content,
    io: req.app.get('io'),
  });

  res.status(201).json({ success: true, message });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  assertParticipant(conversation, req.user._id);

  const total = await Message.countDocuments({ conversation: conversation._id });
  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  messages.reverse();

  res.json({
    success: true,
    messages,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  });
});

const markConversationRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  assertParticipant(conversation, req.user._id);

  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  req.app.get('io')?.to(String(conversation._id)).emit('message:read', {
    conversationId: conversation._id,
    userId: req.user._id,
  });

  res.json({ success: true });
});

export { sendMessage, getMessages, markConversationRead };
