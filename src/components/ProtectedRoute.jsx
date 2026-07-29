import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRoles = [], requiredPermissions = [], children }) => {
    const { user, hasPermission, hasRole } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermissions.length > 0 &&
        !requiredPermissions.some(perm => hasPermission(perm))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;