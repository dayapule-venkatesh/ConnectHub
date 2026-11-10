import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Chat from './pages/Chat';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loader">
        <span className="spinner" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loader">
        <span className="spinner" />
      </div>
    );
  }

  return user ? <Navigate to="/chat" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
