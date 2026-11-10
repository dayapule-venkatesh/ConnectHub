import ApiError from './ApiError.js';

const assertParticipant = (conversation, userId) => {
  const isParticipant = conversation.participants.some((participant) => {
    const participantId = participant?._id || participant;
    return String(participantId) === String(userId);
  });

  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }
};

export { assertParticipant };
