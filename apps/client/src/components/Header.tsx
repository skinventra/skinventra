import { Link } from "react-router-dom";
import SteamLoginButton from "./SteamLoginButton";
import HeaderUserMenu from "./HeaderUserMenu";
import { useAuth } from "../hooks/useAuth";

const Header = () => {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header className="bg-gunmetal-200 border-b border-gunmetal-400">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <h1 className="text-2xl font-bold text-mint tracking-tight hover:text-mint-400 transition-colors">
              skinventra
            </h1>
          </Link>

          {/* Navigation Links */}
          {
            <nav className="flex items-center gap-6">
              <Link
                to="/portfolios"
                className="px-4 py-2 bg-gunmetal-700 text-white font-medium rounded-lg border border-gunmetal-400 hover:bg-mint hover:text-night hover:border-mint transition-all duration-200 hover:shadow-lg"
              >
                Portfolios
              </Link>
            </nav>
          }
        </div>

        {/* Auth section */}
        <div className="flex items-center">
          {!user && <SteamLoginButton />}
          {user && (
            <HeaderUserMenu
              user={user}
              onLogout={logout}
              isLoggingOut={isLoggingOut}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
