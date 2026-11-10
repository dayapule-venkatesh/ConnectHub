import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import { ChatIcon, LogoutIcon, PlusIcon, SearchIcon } from './icons';

const getConversationName = (conversation, currentUserId) => {
  if (conversation.isGroup) return conversation.groupName || 'Group chat';

  const otherParticipant = conversation.participants.find(
    (participant) => String(participant._id) !== String(currentUserId)
  );

  return otherParticipant?.name || 'Unknown user';
};

const getPreview = (conversation) => {
  const message = conversation.lastMessage;

  if (!message) {
    return conversation.isGroup ? 'Group created — say hello' : 'Start the conversation';
  }

  const senderPrefix =
    conversation.isGroup && message.sender?.name
      ? `${message.sender.name.split(' ')[0]}: `
      : '';

  return `${senderPrefix}${message.content}`;
};

const formatTime = (value) => {
  if (!value) return '';

  const date = new Date(value);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

export default function Sidebar({
  currentUser,
  conversations,
  activeId,
  loading,
  connected,
  open,
  onSelect,
  onNewChat,
  onLogout,
}) {
  const [query, setQuery] = useState('');

  const filteredConversations = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversations;

    return conversations.filter((conversation) =>
      getConversationName(conversation, currentUser._id).toLowerCase().includes(term)
    );
  }, [conversations, currentUser._id, query]);

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head">
        <div className="brand-row">
          <div className="brand">
            <span className="logo-mark">
              <ChatIcon size={18} />
            </span>
            <span>ConnectHub</span>
          </div>

          <div className="brand-actions">
            <span
              className={`conn-dot ${connected ? 'online' : ''}`}
              title={connected ? 'Real-time connected' : 'Connecting…'}
            />
            <button className="icon-btn" type="button" onClick={onNewChat} title="New chat">
              <PlusIcon size={18} />
            </button>
          </div>
        </div>

        <div className="search-wrap">
          <SearchIcon size={16} />
          <input
            className="sidebar-search"
            type="search"
            placeholder="Search conversations"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="conversation-list">
        {loading && <div className="list-state">Loading conversations…</div>}

        {!loading && filteredConversations.length === 0 && (
          <div className="list-state">
            <p>{query ? 'No conversations match your search.' : 'No conversations yet.'}</p>
            {!query && (
              <button className="btn btn-primary btn-sm" type="button" onClick={onNewChat}>
                Start a chat
              </button>
            )}
          </div>
        )}

        {filteredConversations.map((conversation) => {
          const name = getConversationName(conversation, currentUser._id);
          const isActive = String(activeId) === String(conversation._id);

          return (
            <button
              key={conversation._id}
              type="button"
              className={`conv-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(conversation._id)}
            >
              <Avatar name={name} group={conversation.isGroup} size={44} />
              <div className="conv-main">
                <div className="conv-top">
                  <span className="conv-name">{name}</span>
                  <span className="conv-time">{formatTime(conversation.updatedAt)}</span>
                </div>
                <div className="conv-preview">{getPreview(conversation)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sidebar-foot">
        <Avatar name={currentUser.name} src={currentUser.avatar} size={38} />
        <div className="user-meta">
          <div className="user-name">{currentUser.name}</div>
          <div className="user-status">@{currentUser.email.split('@')[0]}</div>
        </div>
        <button className="icon-btn" type="button" onClick={onLogout} title="Log out">
          <LogoutIcon size={17} />
        </button>
      </div>
    </aside>
  );
}
