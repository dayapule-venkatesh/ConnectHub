import { Link } from 'react-router-dom';
import { BoltIcon, ChatIcon, LockIcon } from './icons';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <Link to="/" className="brand-logo">
          <span className="logo-mark">
            <ChatIcon size={20} />
          </span>
          ConnectHub
        </Link>

        <div className="auth-copy">
          <h1>
            Real conversations.
            <br />
            <em>Real time.</em>
          </h1>
          <p>
            A full-stack MERN chat platform built with React, Node.js, Express,
            MongoDB, and Socket.IO.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <span className="check">
                <BoltIcon size={14} />
              </span>
              <span>Instant messaging with Socket.IO rooms</span>
            </div>
            <div className="auth-point">
              <span className="check">
                <LockIcon size={14} />
              </span>
              <span>JWT authentication with HTTP-only cookies</span>
            </div>
            <div className="auth-point">
              <span className="check">
                <ChatIcon size={14} />
              </span>
              <span>Private conversations and group chats</span>
            </div>
          </div>
        </div>

        <p className="auth-foot">MVC-structured Express API · React + Vite frontend</p>
      </aside>

      <main className="auth-panel">
        <div className="auth-mobile-brand">
          <span className="logo-mark">
            <ChatIcon size={18} />
          </span>
          ConnectHub
        </div>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
