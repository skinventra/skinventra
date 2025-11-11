import SteamLoginButton from './SteamLoginButton';
import HeaderUserMenu from './HeaderUserMenu';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header className="bg-gunmetal-200 border-b border-gunmetal-400">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-mint tracking-tight">
            skinventra
          </h1>
        </div>

        {/* Auth section */}
        <div className="flex items-center">
          {!user && <SteamLoginButton />}
          {user && <HeaderUserMenu user={user} onLogout={logout} isLoggingOut={isLoggingOut} />}
        </div>
      </div>
    </header>
  );
};

export default Header;

