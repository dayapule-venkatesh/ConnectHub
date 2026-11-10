import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import env from '../config/env.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { createMessage } from '../services/messageService.js';
import { AUTH_COOKIE } from '../utils/cookies.js';

const findAccessibleConversation = async (conversationId, userId) => {
  if (!conversationId || !mongoose.isValidObjectId(conversationId)) return null;

  const conversation = await Conversation.findById(conversationId).select('participants');
  if (!conversation) return null;

  const isParticipant = conversation.participants.some(
    (participantId) => String(participantId) === String(userId)
  );

  return isParticipant ? conversation : null;
};

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies[AUTH_COOKIE];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.id).select('name email avatar');
      if (!user) return next(new Error('Authentication required'));

      socket.user = user;
      return next();
    } catch {
      return next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on('conversation:join', async (conversationId, acknowledge) => {
      try {
        const conversation = await findAccessibleConversation(conversationId, socket.user._id);
        if (!conversation) {
          return acknowledge?.({ ok: false, message: 'Conversation not found' });
        }

        socket.join(String(conversationId));
        return acknowledge?.({ ok: true });
      } catch {
        return acknowledge?.({ ok: false, message: 'Could not join conversation' });
      }
    });

    socket.on('message:send', async (payload, acknowledge) => {
      try {
        const { message } = await createMessage({
          conversationId: payload?.conversationId,
          senderId: socket.user._id,
          content: payload?.content,
          io,
        });

        return acknowledge?.({ ok: true, message });
      } catch (error) {
        return acknowledge?.({
          ok: false,
          message: error.message || 'Could not send message',
        });
      }
    });

    socket.on('typing:start', async (conversationId) => {
      try {
        const conversation = await findAccessibleConversation(conversationId, socket.user._id);
        if (!conversation) return;

        socket.to(String(conversationId)).emit('typing:start', {
          conversationId,
          user: { _id: socket.user._id, name: socket.user.name },
        });
      } catch {
        // Typing indicators are non-critical; ignore lookup failures.
      }
    });

    socket.on('typing:stop', async (conversationId) => {
      try {
        const conversation = await findAccessibleConversation(conversationId, socket.user._id);
        if (!conversation) return;

        socket.to(String(conversationId)).emit('typing:stop', {
          conversationId,
          userId: socket.user._id,
        });
      } catch {
        // Typing indicators are non-critical; ignore lookup failures.
      }
    });

    socket.on('message:read', async (conversationId, acknowledge) => {
      try {
        const conversation = await findAccessibleConversation(conversationId, socket.user._id);
        if (!conversation) {
          return acknowledge?.({ ok: false, message: 'Conversation not found' });
        }

        await Message.updateMany(
          { conversation: conversation._id, sender: { $ne: socket.user._id } },
          { $addToSet: { readBy: socket.user._id } }
        );

        socket.to(String(conversationId)).emit('message:read', {
          conversationId,
          userId: socket.user._id,
        });

        return acknowledge?.({ ok: true });
      } catch {
        return acknowledge?.({ ok: false, message: 'Could not update read status' });
      }
    });
  });
};

export default initSocket;
