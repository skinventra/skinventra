import { useState, useRef, useEffect } from 'react';
import type { User } from '../types/user';

interface HeaderUserMenuProps {
  user: User;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

const HeaderUserMenu = ({ user, onLogout, isLoggingOut = false }: HeaderUserMenuProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User info - clickable */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 hover:bg-gunmetal-700 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-night-700"
        type="button"
      >
        <img
          src={user.avatar}
          alt={user.username}
          className="w-10 h-10 rounded-full border-2 border-night-700"
        />
        <div className="text-left hidden sm:block">
          <div className="text-mint font-medium text-sm">
            {user.username}
          </div>
          <div className="text-cadet-900 text-xs">
            Steam ID: {user.steamId}
          </div>
        </div>
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gunmetal rounded-lg border border-gunmetal-400 shadow-lg overflow-hidden z-50">
          {user.profileUrl && (
            <a
              href={user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 text-cadet-900 hover:text-night-100 hover:bg-gunmetal-700 transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Steam Profile
            </a>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:text-night-100 hover:bg-gunmetal-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderUserMenu;

