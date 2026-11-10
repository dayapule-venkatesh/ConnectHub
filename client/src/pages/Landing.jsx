import { Navigate, Link } from 'react-router-dom';
import { BoltIcon, ChatIcon, LockIcon, UsersIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

const highlights = [
  {
    icon: BoltIcon,
    title: 'Always in sync',
    text: 'Messages arrive instantly, so the conversation never falls behind.',
  },
  {
    icon: LockIcon,
    title: 'Private by default',
    text: 'Secure authentication keeps your conversations between the right people.',
  },
  {
    icon: UsersIcon,
    title: 'Made for your people',
    text: 'Move from one-to-one conversations to groups without changing the flow.',
  },
];

function LandingLoader() {
  return (
    <div className="app-loader">
      <span className="spinner" />
    </div>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return <LandingLoader />;
  if (user) return <Navigate to="/chat" replace />;

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="ConnectHub home">
          <span className="landing-logo">
            <ChatIcon size={20} />
          </span>
          ConnectHub
        </Link>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <Link to="/login" className="landing-sign-in">
            Sign in
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get started
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">
              <span className="eyebrow-dot" /> Conversations, without the distance
            </p>
            <h1>
              Make every message <em>matter.</em>
            </h1>
            <p className="landing-intro">
              ConnectHub keeps your people close with a focused, real-time space for
              private conversations and group chats.
            </p>
            <div className="landing-actions">
              <Link to="/register" className="btn btn-primary">
                Start chatting
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/login" className="landing-secondary-action">
                I already have an account
              </Link>
            </div>
            <p className="landing-note">
              <LockIcon size={14} /> Secure sign-in · No distractions · Built for real conversations
            </p>
          </div>

          <div className="landing-visual" aria-label="ConnectHub conversation preview" role="img">
            <div className="visual-glow visual-glow-one" />
            <div className="visual-glow visual-glow-two" />
            <div className="chat-preview">
              <div className="preview-topbar">
                <div className="preview-person">
                  <span className="preview-avatar">AM</span>
                  <span>
                    <strong>Alex Morgan</strong>
                    <small><span className="online-dot" /> Online now</small>
                  </span>
                </div>
                <span className="preview-more">•••</span>
              </div>
              <div className="preview-messages">
                <div className="preview-date">Today, 10:42 AM</div>
                <div className="preview-bubble preview-bubble-them">Hey! Are we still on for later?</div>
                <div className="preview-bubble preview-bubble-me">Absolutely. I’ll bring the good ideas ✨</div>
                <div className="preview-bubble preview-bubble-them">Perfect. This is going to be great.</div>
                <div className="preview-typing"><span /><span /><span /> Alex is typing</div>
              </div>
              <div className="preview-composer">
                <span>Write a message...</span>
                <span className="preview-send">↗</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features" id="features" aria-labelledby="features-title">
          <div className="features-heading">
            <p className="landing-eyebrow">Everything you need to stay close</p>
            <h2 id="features-title">Simple by design. <em>Powerful in the moment.</em></h2>
          </div>
          <div className="feature-grid">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article className="feature-card" key={title}>
                <span className="feature-icon"><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© 2025 ConnectHub</span>
        <span>Real conversations. Real time.</span>
      </footer>
    </div>
  );
}
