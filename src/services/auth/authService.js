import api from '../api';

const linkUser = async (data) => {
    try {
        const response = await api.post('/users/linkUser', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Failed to link user:', error);
        throw error; 
    }
}

const getRoles = async () => {
    try {
        const response = await api.get('/roles/get-roles');
        return response;
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        throw error; 
    }
}

const getUsers = async () => {
    try {
        const response = await api.get('/users/getAllUsers');
        return response;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
}

const activateSession = async (token) => {
    try {
        const response = await api.post('/sso/activateSession', token);
        return response;
    } catch (error) {
        console.error('Failed to activate session', error);
        throw error;
    }
}

export const authService = {
    getRoles,
    linkUser,
    getUsers,
    activateSession
};