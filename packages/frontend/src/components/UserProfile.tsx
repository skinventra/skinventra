import type { User } from '../types/user';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile = ({ user, onLogout }: UserProfileProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-16 h-16 rounded-full border-2 border-gray-200"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
          <p className="text-sm text-gray-500">Steam ID: {user.steamId}</p>
        </div>
      </div>

      {user.profileUrl && (
        <a
          href={user.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 text-blue-600 hover:text-blue-800 text-sm"
        >
          View Steam Profile →
        </a>
      )}

      <button
        onClick={onLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        type="button"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;

