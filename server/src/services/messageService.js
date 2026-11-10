import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import ApiError from '../utils/ApiError.js';
import { assertParticipant } from '../utils/conversationAccess.js';

const createMessage = async ({ conversationId, senderId, content, io }) => {
  const trimmedContent = content?.trim();

  if (!conversationId) throw new ApiError(400, 'conversationId is required');
  if (!trimmedContent) throw new ApiError(400, 'Message cannot be empty');
  if (trimmedContent.length > 2000) {
    throw new ApiError(400, 'Message cannot exceed 2000 characters');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  assertParticipant(conversation, senderId);

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content: trimmedContent,
    readBy: [senderId],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await message.populate('sender', 'name email avatar');

  if (io) {
    const room = String(conversation._id);
    io.to(room).emit('message:new', populatedMessage);

    conversation.participants.forEach((participantId) => {
      io.to(`user:${participantId}`).emit('conversation:updated', {
        conversationId: conversation._id,
        lastMessage: populatedMessage,
        updatedAt: conversation.updatedAt,
      });
    });
  }

  return { message: populatedMessage, conversation };
};

export { createMessage };
