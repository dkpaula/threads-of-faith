import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const Logout = () => {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return null;
};

export default Logout;