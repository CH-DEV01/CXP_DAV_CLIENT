import api from '../api';

const getDisclaimerBody = async(payload) => {

    try {
        const response = await api.get(`/disclaimers/${payload}`);
        return response.data;
    } catch (error) {
        console.error('Error getting disclaimer body', error);
        throw error;
    }
};

export const disclaimerService = {
    getDisclaimerBody
};