import api from "../api";

export const getParamters = async () => {
    try {

        const response = await api.get('/parameters/allParameters');
        return response;
    } catch (error) {
        console.error('Error fetching Paramters:', error);
        throw error;
    }
}

export const updateParameters = async (payload) => {
    try {
        const response = await api.put('/parameters/updateParameters', payload);
        return response.data;
    } catch (error) {
        console.error('Error updating Parameters', error);
        throw error;
    }
}

export const parametersService = {
    getParamters,
    updateParameters
};
