import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { assertParticipant } from '../utils/conversationAccess.js';

const populateConversation = (query) =>
  query
    .populate('participants', 'name email avatar about')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' },
    });

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) throw new ApiError(400, 'userId is required');
  if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, 'Invalid user id');
  if (String(userId) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot start a conversation with yourself');
  }

  const otherUser = await User.findById(userId).select('_id');
  if (!otherUser) throw new ApiError(404, 'User not found');

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [req.user._id, userId], $size: 2 },
  });

  let created = false;
  if (!conversation) {
    conversation = await Conversation.create({ participants: [req.user._id, userId] });
    created = true;
  }

  const populatedConversation = await populateConversation(
    Conversation.findById(conversation._id)
  );

  if (created) {
    req.app.get('io')?.to(`user:${userId}`).emit('conversation:new', populatedConversation);
  }

  res.status(created ? 201 : 200).json({ success: true, conversation: populatedConversation });
});

const createGroup = asyncHandler(async (req, res) => {
  const { name, userIds } = req.body;

  if (!name?.trim() || name.trim().length < 2) {
    throw new ApiError(400, 'Group name must be at least 2 characters');
  }
  if (!Array.isArray(userIds)) throw new ApiError(400, 'userIds must be an array');

  const uniqueIds = [...new Set(userIds.map(String))].filter(
    (id) => id !== String(req.user._id)
  );

  if (uniqueIds.length < 2) {
    throw new ApiError(400, 'Add at least two other members to create a group');
  }
  if (!uniqueIds.every((id) => mongoose.isValidObjectId(id))) {
    throw new ApiError(400, 'One or more user ids are invalid');
  }

  const members = await User.find({ _id: { $in: uniqueIds } }).select('_id');
  if (members.length !== uniqueIds.length) {
    throw new ApiError(404, 'One or more users were not found');
  }

  const conversation = await Conversation.create({
    participants: [req.user._id, ...members.map((member) => member._id)],
    isGroup: true,
    groupName: name.trim(),
    groupAdmin: req.user._id,
  });

  const populatedConversation = await populateConversation(
    Conversation.findById(conversation._id)
  );

  const io = req.app.get('io');
  populatedConversation.participants.forEach((participant) => {
    io?.to(`user:${participant._id}`).emit('conversation:new', populatedConversation);
  });

  res.status(201).json({ success: true, conversation: populatedConversation });
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await populateConversation(
    Conversation.find({ participants: req.user._id }).sort({ updatedAt: -1 })
  );

  res.json({ success: true, conversations });
});

const getConversation = asyncHandler(async (req, res) => {
  const conversation = await populateConversation(Conversation.findById(req.params.id));
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  assertParticipant(conversation, req.user._id);
  res.json({ success: true, conversation });
});

const renameGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) throw new ApiError(400, 'Group name is required');

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  assertParticipant(conversation, req.user._id);
  if (!conversation.isGroup) throw new ApiError(400, 'This conversation is not a group');
  if (String(conversation.groupAdmin) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the group admin can rename the group');
  }

  conversation.groupName = name.trim();
  await conversation.save();

  const populatedConversation = await populateConversation(
    Conversation.findById(conversation._id)
  );
  res.json({ success: true, conversation: populatedConversation });
});

const addToGroup = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'A valid userId is required');
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.isGroup) throw new ApiError(400, 'This conversation is not a group');
  if (String(conversation.groupAdmin) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the group admin can add members');
  }
  if (conversation.participants.some((id) => String(id) === String(userId))) {
    throw new ApiError(400, 'User is already a member of this group');
  }

  const user = await User.findById(userId).select('_id');
  if (!user) throw new ApiError(404, 'User not found');

  conversation.participants.push(user._id);
  await conversation.save();

  const populatedConversation = await populateConversation(
    Conversation.findById(conversation._id)
  );
  req.app.get('io')?.to(`user:${userId}`).emit('conversation:new', populatedConversation);

  res.json({ success: true, conversation: populatedConversation });
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.isGroup) throw new ApiError(400, 'This conversation is not a group');

  assertParticipant(conversation, req.user._id);

  const targetId = req.body.userId || req.user._id;
  const isAdmin = String(conversation.groupAdmin) === String(req.user._id);
  const isLeavingSelf = String(targetId) === String(req.user._id);

  if (!isAdmin && !isLeavingSelf) {
    throw new ApiError(403, 'Only the group admin can remove members');
  }
  if (!conversation.participants.some((id) => String(id) === String(targetId))) {
    throw new ApiError(400, 'User is not a member of this group');
  }

  conversation.participants = conversation.participants.filter(
    (id) => String(id) !== String(targetId)
  );

  if (conversation.participants.length === 0) {
    await conversation.deleteOne();
    return res.json({ success: true, message: 'Group deleted' });
  }

  if (String(conversation.groupAdmin) === String(targetId)) {
    conversation.groupAdmin = conversation.participants[0];
  }

  await conversation.save();
  req.app.get('io')?.to(`user:${targetId}`).emit('conversation:removed', {
    conversationId: conversation._id,
  });

  res.json({ success: true, message: 'Member removed' });
});

export {
  accessChat,
  createGroup,
  getConversations,
  getConversation,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
