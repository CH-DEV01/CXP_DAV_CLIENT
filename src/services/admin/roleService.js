import api from '../api';

const getRoles = async () => {
    try {
        const response = await api.get('/roles');
        return response;
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        throw error; 
    }
}

export const roleService = {
    getRoles
};