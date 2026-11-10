import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchUsers = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json({ success: true, users: [] });

  const safeQuery = escapeRegex(query);
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { name: { $regex: safeQuery, $options: 'i' } },
      { email: { $regex: safeQuery, $options: 'i' } },
    ],
  })
    .select('name email avatar about')
    .limit(20);

  res.json({ success: true, users });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, about, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters');
    }
    user.name = name.trim();
  }

  if (about !== undefined) {
    if (typeof about !== 'string') throw new ApiError(400, 'About must be text');
    user.about = about.trim();
  }

  if (avatar !== undefined) {
    if (typeof avatar !== 'string') throw new ApiError(400, 'Avatar must be text');
    user.avatar = avatar.trim();
  }

  await user.save();
  res.json({ success: true, user: user.toSafeJSON() });
});

export { searchUsers, updateProfile };
