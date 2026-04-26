import { PERMISSIONS } from '../constants/permissions';

import Login from '../pages/auth/Login';

export const routes = [
    {
        path: '/',
        element: <Login />,
        permissions: null // Accesible a todos
    },
    {
        path: '/login',
        element: <Login />,
        permissions: null
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
        permissions: [PERMISSIONS.VIEW_DASHBOARD]
    },
    {
        path: '/users',
        element: <UserManagement />,
        permissions: [PERMISSIONS.MANAGE_USERS]
    },
    {
        path: '/content',
        element: <ContentEditor />,
        permissions: [PERMISSIONS.EDIT_CONTENT]
    }
];