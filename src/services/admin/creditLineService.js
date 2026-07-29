import api from "../api";

// READ DETAILS
export const getPayerCreditLineDetails = async(payerId) => {
    try {

        const response = await api.get(`/credit-lines/${payerId}/details`);
        return response;

    } catch (error) {

        console.error('Error fetching credit line details:', error);
        throw error;

    }
}

// RESTORE LINE (CREATE ABONO)
export const restoreCreditLine = async(payload) => {
    try {

        const data = {
            "payerId": payload.payerId,
            "amount": payload.amount,
            "reference": payload.reference,
            "type": payload.type,
            "userId": payload.userId
        }

        const response = await api.post('/credit-lines/restore', data);
        return response.data;

    } catch (error) {

        console.error('Error restoring Credit Line:', error);

        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }

        throw error;

    }
}

export const getPayers = async() => {
    try {
        const response = await api.get('/credit-lines/payers');
        return response.data;
    } catch (error) {
        console.error('Error fetching Payers for select:', error);
        throw error;
    }
}

export const creditLineService = {
    getPayerCreditLineDetails,
    restoreCreditLine,
    getPayers
};