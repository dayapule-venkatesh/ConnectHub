import { UsersIcon } from './icons';

const palette = [
  '#0e6b5b',
  '#c96f4a',
  '#3b7d9e',
  '#b8892f',
  '#6f8f3f',
  '#b5564f',
  '#2f7f76',
  '#4a6fa5',
];

const hashCode = (value = '') =>
  [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

export default function Avatar({ name = '', src = '', size = 44, group = false, className = '' }) {
  const style = {
    width: size,
    height: size,
    fontSize: Math.max(11, Math.round(size * 0.36)),
    background: group
      ? 'linear-gradient(135deg, #127564, #0a5447)'
      : palette[hashCode(name) % palette.length],
  };

  return (
    <div className={`avatar ${className}`} style={style} title={name}>
      {src ? (
        <img src={src} alt={name} />
      ) : group ? (
        <UsersIcon size={Math.round(size * 0.46)} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
