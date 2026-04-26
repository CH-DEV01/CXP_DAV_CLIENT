import api from "../api";

// CREATE
export const createUser = async (payload) => {
    try {

        const data = {
            "param_key": payload.param_key,
            "param_value": payload.param_value
        }

        const response = await api.post('/users/getAllUsers', data);
        return response;

    } catch (error) {

        console.error('Error fetching Paramters:', error);
        throw error;

    }
}

// READ ALL

const getUsers = async () => {
    try {
        const response = await api.get('/users/getAllUsers');
        return response;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
}

export const getParameters = async () => {
    try {

        const response = await api.get('/parameters');
        return response;
    } catch (error) {
        console.error('Error fetching Paramters:', error);
        throw error;
    }
}

// UPDATE
export const updateUser = async (id, payload) => {
    try {

        const data = {
            "param_key": payload.param_key,
            "param_value": payload.param_value
        }

        const response = await api.put(`/parameters/${id}`, data);

        return response.data;

    } catch (error) {

        console.error('Error updating Parameters', error);
        throw error;

    }
}

// DELETE
export const deleteUser = async (id) => {
    try {

        const response = await api.delete(`/parameters/${id}`);

        return response;

    } catch (error) {

        console.error('Error updating Parameters', error);
        throw error;

    }
}

export const userService = {
    createUser,
    getUsers,
    updateUser,
    deleteUser
};
