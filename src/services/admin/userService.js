import api from "../api";

// CREATE
export const createUser = async(payload) => {
    try {

        const data = {
            "email": payload.email,
            "name": payload.name,
            "dui": payload.dui,
            "entityId": payload.entityId,
            "roleId": payload.roleId
        }

        console.log(data);

        const response = await api.post('/users/linkUser', data);
        return response;

    } catch (error) {

        console.error('Error saving user:', error);
        throw error;

    }
}

// READ ALL

const getUsers = async() => {
    try {
        const response = await api.get('/users/getAllUsers');
        return response;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
}

export const getParameters = async() => {
    try {

        const response = await api.get('/parameters');
        return response;
    } catch (error) {
        console.error('Error fetching Paramters:', error);
        throw error;
    }
}

// UPDATE
export const updateUser = async(id, payload) => {
    try {

        const data = {
            "name": payload.name,
            "dui": payload.dui,
            "email": payload.email,
            "entityId": payload.entityId,
            "roleId": payload.roleId
        }

        const response = await api.put(`users/${id}`, data);

        return response.data;

    } catch (error) {

        console.error('Error updating user', error);
        throw error;

    }
}

// DELETE
export const deleteUser = async(id) => {
    try {

        const response = await api.delete(`/users/delete/${id}`);

        return response;

    } catch (error) {

        console.error('Error deleting user', error);
        throw error;

    }
}

export const userService = {
    createUser,
    getUsers,
    updateUser,
    deleteUser
};