interface SteamLoginButtonProps {
  onClick?: () => void;
}

const SteamLoginButton = ({ onClick }: SteamLoginButtonProps) => {
  // In development with path-based routing: leave VITE_API_URL empty
  // In production: set VITE_API_URL to your backend domain
  const API_URL = import.meta.env.VITE_API_URL || '';
  const handleSteamLogin = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `${API_URL}/auth/steam`;
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

