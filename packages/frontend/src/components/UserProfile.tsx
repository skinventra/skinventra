import type { User } from '../types/user';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile = ({ user, onLogout }: UserProfileProps) => {
  return (
    <div className="bg-gunmetal rounded-lg border border-gunmetal-400 p-6 max-w-md w-full">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-16 h-16 rounded-full border-2 border-night-700"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-mint">{user.username}</h2>
          <p className="text-sm text-cadet-900">Steam ID: {user.steamId}</p>
        </div>
      </div>

      {user.profileUrl && (
        <a
          href={user.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 text-night-800 hover:text-night-900 text-sm transition-colors"
        >
          View Steam Profile →
        </a>
      )}

      <button
        onClick={onLogout}
        className="w-full bg-gunmetal-700 hover:bg-gunmetal-800 text-night-100 font-medium py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-night-700 focus:ring-offset-2 focus:ring-offset-gunmetal"
        type="button"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;

