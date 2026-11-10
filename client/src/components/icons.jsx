const iconProps = (size, className) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className,
  'aria-hidden': true,
});

export const SendIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const PlusIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const SearchIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MenuIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const LogoutIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

export const UsersIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const ChatIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const CheckIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const DoubleCheckIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="m2 12 4 4L16 6" />
    <path d="m9 12 4 4L23 6" />
  </svg>
);

export const CloseIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const LockIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const BoltIcon = ({ size = 20, className = '' }) => (
  <svg {...iconProps(size, className)}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />
  </svg>
);
