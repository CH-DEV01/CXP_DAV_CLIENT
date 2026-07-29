import { useAuth } from '../context/AuthContext';

export default function useAuthorization() {
  const { user } = useAuth();

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return { hasRole };
}