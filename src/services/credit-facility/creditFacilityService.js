import api from '../api';

const getCreditFacilityDetail = async({ identifier, identifierType }) => {

    if (!identifier || !identifierType) {
        const errorMsg = 'Faltan parámetros obligatorios para consultar la facilidad de crédito.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    const request = {
        identifier,
        identifierType
    };

    try {
        const response = await api.post('/sso/credit-facility/details', request);
        return response.data;
    } catch (error) {
        console.error('Error getting credit facility detail:', error);
        throw error;
    }
};

export const creditFacilityService = {
    getCreditFacilityDetail
};