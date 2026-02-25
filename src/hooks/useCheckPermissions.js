import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useCheckPermissions = ({ roles = [], permissions = [] }) => {
  const { user, hasRole, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const hasRequiredRole = hasRole(roles);
    const hasRequiredPermission = hasPermission(permissions);

    if (!hasRequiredRole || !hasRequiredPermission) {
      navigate('/unauthorized');
    }
  }, [user, roles, permissions, hasRole, hasPermission, navigate]);
};

export default useCheckPermissions;