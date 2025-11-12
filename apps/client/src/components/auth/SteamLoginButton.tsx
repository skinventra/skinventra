import { API_ENDPOINTS } from '../../config/api';

interface SteamLoginButtonProps {
  onClick?: () => void;
}

const SteamLoginButton = ({ onClick }: SteamLoginButtonProps) => {
  const handleSteamLogin = () => {
    if (onClick) {
      onClick();
    } else {
      const path = window.location.pathname;
      sessionStorage.setItem('returnUrl', path);
      window.location.href = API_ENDPOINTS.auth.steam;
    }
  };

  return (
    <button
      onClick={handleSteamLogin}
      className="cursor-pointer transition-opacity hover:opacity-90 active:opacity-75 focus:outline-none"
      type="button"
      aria-label="Sign in through Steam"
    >
      <img
        src="/steam-login-button.png"
        alt="Sign in through Steam"
        className="w-auto h-auto max-w-full"
      />
    </button>
  );
};

export default SteamLoginButton;

