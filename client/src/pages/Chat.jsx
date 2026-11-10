import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';

export default function Chat() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showNewChat, setShowNewChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia('(min-width: 901px)').matches
  );
  const [toast, setToast] = useState('');

  const activeIdRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadConversations = useCallback(async () => {
    const { data } = await api.get('/conversations');
    setConversations(data.conversations);
    return data.conversations;
  }, []);

  useEffect(() => {
    let active = true;

    loadConversations()
      .catch(() => {
        if (active) setToast('Could not load your conversations.');
      })
      .finally(() => {
        if (active) setLoadingConversations(false);
      });

    return () => {
      active = false;
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return undefined;
    }

    let active = true;
    setLoadingMessages(true);

    api
      .get(`/messages/${activeId}`)
      .then(({ data }) => {
        if (active) setMessages(data.messages);
      })
      .catch(() => {
        if (active) {
          setMessages([]);
          setToast('Could not load messages for this conversation.');
        }
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });

    return () => {
      active = false;
    };
  }, [activeId]);

  useEffect(() => {
    if (!socket || !activeId) return;

    socket.emit('conversation:join', activeId);
    socket.emit('message:read', activeId);
    setTypingUsers((previous) => ({ ...previous, [activeId]: {} }));
  }, [socket, activeId]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (message) => {
      const conversationId = String(message.conversation);

      if (conversationId === String(activeIdRef.current)) {
        setMessages((previous) =>
          previous.some((item) => item._id === message._id)
            ? previous
            : [...previous, message]
        );
        socket.emit('message:read', conversationId);
      }

      setConversations((previous) => {
        if (!previous.some((item) => String(item._id) === conversationId)) {
          loadConversations().catch(() => {});
          return previous;
        }

        const updated = previous.map((item) =>
          String(item._id) === conversationId
            ? { ...item, lastMessage: message, updatedAt: message.createdAt }
            : item
        );

        return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const handleConversationUpdated = ({ conversationId, lastMessage, updatedAt }) => {
      setConversations((previous) => {
        if (!previous.some((item) => String(item._id) === String(conversationId))) {
          loadConversations().catch(() => {});
          return previous;
        }

        const updated = previous.map((item) =>
          String(item._id) === String(conversationId)
            ? { ...item, lastMessage, updatedAt }
            : item
        );

        return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const handleConversationNew = (conversation) => {
      setConversations((previous) =>
        previous.some((item) => String(item._id) === String(conversation._id))
          ? previous
          : [conversation, ...previous]
      );
    };

    const handleConversationRemoved = ({ conversationId }) => {
      setConversations((previous) =>
        previous.filter((item) => String(item._id) !== String(conversationId))
      );

      if (String(activeIdRef.current) === String(conversationId)) {
        setActiveId(null);
      }
    };

    const handleTypingStart = ({ conversationId, user: typingUser }) => {
      if (!typingUser || String(typingUser._id) === String(user._id)) return;

      setTypingUsers((previous) => ({
        ...previous,
        [conversationId]: {
          ...(previous[conversationId] || {}),
          [typingUser._id]: typingUser.name,
        },
      }));
    };

    const handleTypingStop = ({ conversationId, userId }) => {
      setTypingUsers((previous) => {
        const forConversation = { ...(previous[conversationId] || {}) };
        delete forConversation[userId];
        return { ...previous, [conversationId]: forConversation };
      });
    };

    const handleRead = ({ conversationId, userId }) => {
      if (String(conversationId) !== String(activeIdRef.current)) return;

      setMessages((previous) =>
        previous.map((message) => {
          if (String(message.sender?._id) !== String(user._id)) return message;

          const readBy = message.readBy || [];
          if (readBy.some((id) => String(id) === String(userId))) return message;

          return { ...message, readBy: [...readBy, userId] };
        })
      );
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('conversation:new', handleConversationNew);
    socket.on('conversation:removed', handleConversationRemoved);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:read', handleRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('conversation:new', handleConversationNew);
      socket.off('conversation:removed', handleConversationRemoved);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:read', handleRead);
    };
  }, [socket, user._id, loadConversations]);

  const sendMessage = useCallback(
    async (content) => {
      const trimmed = content.trim();
      if (!trimmed || !activeId) return;

      if (socket?.connected) {
        socket.emit(
          'message:send',
          { conversationId: activeId, content: trimmed },
          (response) => {
            if (!response?.ok) {
              setToast(response?.message || 'Message could not be sent.');
              return;
            }

            setMessages((previous) =>
              previous.some((item) => item._id === response.message._id)
                ? previous
                : [...previous, response.message]
            );
          }
        );
        socket.emit('typing:stop', activeId);
        return;
      }

      try {
        const { data } = await api.post('/messages', {
          conversationId: activeId,
          content: trimmed,
        });

        setMessages((previous) =>
          previous.some((item) => item._id === data.message._id)
            ? previous
            : [...previous, data.message]
        );
      } catch (error) {
        setToast(error.response?.data?.message || 'Message could not be sent.');
      }
    },
    [activeId, socket]
  );

  const handleTyping = useCallback(() => {
    if (!socket || !activeId) return;

    socket.emit('typing:start', activeId);
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit('typing:stop', activeId);
    }, 1200);
  }, [socket, activeId]);

  const startDirectChat = async (userId) => {
    try {
      const { data } = await api.post('/conversations', { userId });

      setConversations((previous) =>
        previous.some((item) => String(item._id) === String(data.conversation._id))
          ? previous
          : [data.conversation, ...previous]
      );
      setActiveId(data.conversation._id);
      setShowNewChat(false);
      setSidebarOpen(false);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Could not start this conversation.');
    }
  };

  const createGroup = async (name, userIds) => {
    try {
      const { data } = await api.post('/conversations/group', { name, userIds });

      setConversations((previous) => [
        data.conversation,
        ...previous.filter((item) => String(item._id) !== String(data.conversation._id)),
      ]);
      setActiveId(data.conversation._id);
      setShowNewChat(false);
      setSidebarOpen(false);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Could not create the group.');
    }
  };

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => String(conversation._id) === String(activeId)) ||
      null,
    [conversations, activeId]
  );

  return (
    <div className="chat-shell">
      <Sidebar
        currentUser={user}
        conversations={conversations}
        activeId={activeId}
        loading={loadingConversations}
        connected={connected}
        open={sidebarOpen}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => setShowNewChat(true)}
        onLogout={logout}
      />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        currentUser={user}
        loading={loadingMessages}
        connected={connected}
        typingUsers={activeId ? Object.values(typingUsers[activeId] || {}) : []}
        onSend={sendMessage}
        onTyping={handleTyping}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNewChat={() => setShowNewChat(true)}
      />

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onStartChat={startDirectChat}
          onCreateGroup={createGroup}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
