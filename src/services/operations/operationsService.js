import api from '../api';

const calculateInterests = async (payload) => {
    try {
        const response = await api.post('/operations/calculate', payload);
        return response.data;
    } catch (error) {
        console.error('Error calculating interests:', error);
        throw error;
    }
};

export const operationsService = {
    calculateInterests
};


