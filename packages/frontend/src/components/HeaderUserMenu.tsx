import type { User } from '../types/user';

interface HeaderUserMenuProps {
  user: User;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

const HeaderUserMenu = ({ user, onLogout, isLoggingOut = false }: HeaderUserMenuProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* User info */}
      <div className="flex items-center gap-2">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-10 h-10 rounded-full border-2 border-night-700"
        />
        <span className="text-mint font-medium text-sm hidden sm:inline">
          {user.username}
        </span>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="px-4 py-2 bg-gunmetal-700 hover:bg-gunmetal-800 text-cadet-900 hover:text-night-100 font-medium text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-night-700 focus:ring-offset-2 focus:ring-offset-gunmetal-200 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default HeaderUserMenu;

