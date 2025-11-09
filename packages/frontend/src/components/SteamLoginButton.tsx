const SteamLoginButton = () => {
  const handleSteamLogin = () => {
    // TODO: Implement Steam authentication
    console.log('Steam login clicked');
  };

  return (
    <button
      onClick={handleSteamLogin}
      className="cursor-pointer transition-opacity hover:opacity-90 active:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

