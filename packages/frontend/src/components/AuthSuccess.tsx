import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-night flex items-center justify-center">
      <div className="bg-gunmetal rounded-lg border border-gunmetal-400 p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-night-700 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-mint mb-2">
          Authentication Successful!
        </h2>
        <p className="text-cadet-900">
          Redirecting to home page...
        </p>
      </div>
    </div>
  );
};

export default AuthSuccess;

