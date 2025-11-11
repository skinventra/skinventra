import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { refetch } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const returnUrl = sessionStorage.getItem('returnUrl');
      
      await refetch();
      
      const finalUrl = returnUrl || '/';
      
      sessionStorage.removeItem('returnUrl');
      navigate(finalUrl);
    };

    handleAuthSuccess();
  }, [navigate, refetch]);

  return null;
};

export default AuthSuccess;

