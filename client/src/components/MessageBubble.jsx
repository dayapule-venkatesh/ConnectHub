import Avatar from './Avatar';
import { CheckIcon, DoubleCheckIcon } from './icons';

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function MessageBubble({ message, mine, showSender }) {
  const isRead = (message.readBy || []).length > 1;
  const senderName = message.sender?.name || 'Unknown user';

  return (
    <div className={`msg-row ${mine ? 'mine' : 'theirs'}`}>
      {!mine && <Avatar name={senderName} src={message.sender?.avatar} size={30} />}

      <div className="msg-col">
        {showSender && !mine && <div className="msg-sender">{senderName}</div>}

        <div className="bubble">{message.content}</div>

        <div className="msg-meta">
          <span>{formatTime(message.createdAt)}</span>
          {mine && (
            <span
              className={`read-tick ${isRead ? 'read' : ''}`}
              title={isRead ? 'Read' : 'Sent'}
            >
              {isRead ? <DoubleCheckIcon size={13} /> : <CheckIcon size={13} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
