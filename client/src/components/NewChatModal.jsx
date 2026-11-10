import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Avatar from './Avatar';
import { CloseIcon, SearchIcon } from './icons';

export default function NewChatModal({ onClose, onStartChat, onCreateGroup }) {
  const [tab, setTab] = useState('direct');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const term = query.trim();

    if (!term) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await api.get('/users/search', { params: { q: term } });
        setResults(data.users);
      } catch (requestError) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedIds = useMemo(() => new Set(selected.map((user) => user._id)), [selected]);

  const toggleSelected = (user) => {
    setSelected((previous) =>
      previous.some((item) => item._id === user._id)
        ? previous.filter((item) => item._id !== user._id)
        : [...previous, user]
    );
  };

  const handleDirect = async (userId) => {
    setError('');
    setSubmitting(true);

    try {
      await onStartChat(userId);
    } catch (requestError) {
      setError(requestError.message || 'Could not start this conversation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroup = async () => {
    setError('');

    if (groupName.trim().length < 2) {
      setError('Enter a group name (at least 2 characters).');
      return;
    }

    if (selected.length < 2) {
      setError('Select at least two people for a group.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateGroup(groupName.trim(), selected.map((user) => user._id));
    } catch (requestError) {
      setError(requestError.message || 'Could not create the group.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="New conversation">
        <div className="modal-head">
          <div>
            <h3>New conversation</h3>
            <p className="modal-sub">Find someone by name or email.</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button
              type="button"
              className={`tab ${tab === 'direct' ? 'active' : ''}`}
              onClick={() => setTab('direct')}
            >
              Direct message
            </button>
            <button
              type="button"
              className={`tab ${tab === 'group' ? 'active' : ''}`}
              onClick={() => setTab('group')}
            >
              Group
            </button>
          </div>

          {tab === 'group' && (
            <>
              <div className="field">
                <label htmlFor="group-name">Group name</label>
                <input
                  id="group-name"
                  className="input"
                  placeholder="e.g. Project Alpha"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  maxLength={80}
                />
              </div>

              {selected.length > 0 && (
                <div className="selected-chips">
                  {selected.map((user) => (
                    <span key={user._id} className="chip">
                      {user.name}
                      <button
                        type="button"
                        onClick={() => toggleSelected(user)}
                        aria-label={`Remove ${user.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="search-wrap modal-search">
            <SearchIcon size={16} />
            <input
              className="input search-input"
              type="search"
              placeholder="Search by name or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="user-results">
            {searching && <div className="list-state">Searching…</div>}

            {!searching && query.trim() && results.length === 0 && (
              <div className="list-state">No users found.</div>
            )}

            {!searching && !query.trim() && (
              <div className="list-state muted">
                Type a name or email to search registered users.
              </div>
            )}

            {results.map((user) => (
              <button
                key={user._id}
                type="button"
                className="user-result"
                onClick={() => (tab === 'group' ? toggleSelected(user) : handleDirect(user._id))}
                disabled={submitting}
              >
                <Avatar name={user.name} src={user.avatar} size={40} />
                <div className="user-result-main">
                  <div className="user-name">{user.name}</div>
                  <div className="user-status">{user.email}</div>
                </div>
                {tab === 'group' && (
                  <span className={`select-box ${selectedIds.has(user._id) ? 'checked' : ''}`}>
                    {selectedIds.has(user._id) ? '✓' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === 'group' && (
          <div className="modal-foot">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleGroup}
              disabled={submitting}
            >
              {submitting ? 'Creating…' : `Create group${selected.length ? ` (${selected.length})` : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
