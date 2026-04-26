import api from "../api";

// CREATE
export const createParameter = async (payload) => {
    try {

        const data = {
            "param_key": payload.param_key,
            "param_value": payload.param_value
        }

        const response = await api.post('/parameters', data);
        return response;

    } catch (error) {

        console.error('Error fetching Paramters:', error);
        throw error;

    }
}

// READ ALL
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
export const updateParameter = async (id, payload) => {
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
export const deleteParameter = async (id) => {
    try {

        const response = await api.delete(`/parameters/${id}`);

        return response;

    } catch (error) {

        console.error('Error updating Parameters', error);
        throw error;

    }
}

export const parametersService = {
    createParameter,
    getParameters,
    updateParameter,
    deleteParameter
};
