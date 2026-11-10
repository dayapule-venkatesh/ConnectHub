import { Fragment, useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import { ChatIcon, MenuIcon, SendIcon } from './icons';

const getConversationName = (conversation, currentUserId) => {
  if (conversation.isGroup) return conversation.groupName || 'Group chat';

  const otherParticipant = conversation.participants.find(
    (participant) => String(participant._id) !== String(currentUserId)
  );

  return otherParticipant?.name || 'Unknown user';
};

const getSubtitle = (conversation, currentUserId) => {
  if (conversation.isGroup) {
    return `${conversation.participants.length} members`;
  }

  const otherParticipant = conversation.participants.find(
    (participant) => String(participant._id) !== String(currentUserId)
  );

  return otherParticipant?.about || 'Available';
};

const formatDay = (value) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

export default function ChatWindow({
  conversation,
  messages,
  currentUser,
  loading,
  connected,
  typingUsers,
  onSend,
  onTyping,
  onOpenSidebar,
  onNewChat,
}) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingUsers]);

  useEffect(() => {
    setDraft('');
  }, [conversation?._id]);

  const submit = () => {
    const value = draft.trim();
    if (!value) return;

    onSend(value);
    setDraft('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const handleChange = (event) => {
    setDraft(event.target.value);
    onTyping();

    const element = event.target;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  };

  if (!conversation) {
    return (
      <section className="chat-window empty">
        <header className="chat-header">
          <button className="icon-btn menu-btn" type="button" onClick={onOpenSidebar}>
            <MenuIcon size={18} />
          </button>
          <div className="chat-title">ConnectHub</div>
        </header>

        <div className="chat-empty">
          <div className="icon-wrap">
            <ChatIcon size={28} />
          </div>
          <h3>Your conversations live here</h3>
          <p>Pick a conversation from the sidebar or start a new one.</p>
          <button className="btn btn-primary" type="button" onClick={onNewChat}>
            New conversation
          </button>
        </div>
      </section>
    );
  }

  const name = getConversationName(conversation, currentUser._id);
  let lastDay = '';

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button className="icon-btn menu-btn" type="button" onClick={onOpenSidebar}>
          <MenuIcon size={18} />
        </button>

        <Avatar name={name} group={conversation.isGroup} size={42} />

        <div className="chat-head-text">
          <div className="chat-title">{name}</div>
          <div className="chat-sub">
            <span className={`status-dot ${connected ? 'online' : ''}`} />
            {connected ? getSubtitle(conversation, currentUser._id) : 'Connecting…'}
          </div>
        </div>
      </header>

      <div className="messages">
        {loading && <div className="messages-state">Loading messages…</div>}

        {!loading && messages.length === 0 && (
          <div className="messages-state">
            No messages yet. Say hello to start the conversation.
          </div>
        )}

        {!loading &&
          messages.map((message) => {
            const day = new Date(message.createdAt).toDateString();
            const showDay = day !== lastDay;
            lastDay = day;

            return (
              <Fragment key={message._id}>
                {showDay && <div className="day-divider">{formatDay(message.createdAt)}</div>}
                <MessageBubble
                  message={message}
                  mine={String(message.sender?._id) === String(currentUser._id)}
                  showSender={conversation.isGroup}
                />
              </Fragment>
            );
          })}

        <div ref={bottomRef} />
      </div>

      <div className="typing-slot">
        {typingUsers.length > 0 && (
          <span className="typing-text">
            {typingUsers.slice(0, 2).join(', ')}
            {typingUsers.length > 2 ? ` +${typingUsers.length - 2}` : ''}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing
            <span className="typing-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </span>
        )}
      </div>

      <footer className="composer">
        <div className="composer-box">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={`Message ${name}`}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={2000}
          />
          <button
            className="send-btn"
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            title="Send message"
          >
            <SendIcon size={19} />
          </button>
        </div>
      </footer>
    </section>
  );
}
