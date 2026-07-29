import { useAuth } from '../context/AuthContext';

const AccessControl = ({
    requiredPermissions = [],
    children,
    fallback = null
}) => {
    const { hasPermission } = useAuth();

    const hasAccess = requiredPermissions.every(perm => hasPermission(perm));

    return hasAccess ? children : fallback;
};

export default AccessControl;