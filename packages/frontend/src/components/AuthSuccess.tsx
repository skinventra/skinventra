import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { refetch } = useAuth();

  useEffect(() => {
    // Refetch auth status and redirect immediately
    const handleAuthSuccess = async () => {
      await refetch();
      navigate('/');
    };

    handleAuthSuccess();
  }, [navigate, refetch]);

  return null;
};

export default AuthSuccess;

