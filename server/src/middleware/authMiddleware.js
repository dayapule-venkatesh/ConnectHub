import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { AUTH_COOKIE } from '../utils/cookies.js';

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[AUTH_COOKIE];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new ApiError(401, 'Not authorized, please log in');

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The account linked to this session no longer exists');
  }

  req.user = user;
  next();
});

export { protect };
