import api from '../api';

const getPayersResume = async() => {

    try {
        const response = await api.get('/entities/resume');
        return response.data;
    } catch (error) {
        console.error('Error getting entities resumen: ', error);
        throw error;
    }
};

const getDocumentsForBatchPreview = async(payerId) => {
    try {
        const response = await api.get(`/batch/preview/${payerId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting preview documents: ', error);
        throw error;
    }
};

const generateBatchExcel = async(payload, userId) => {
    try {
        const response = await api.post(`/batch/generate`, payload, {
            params: { userId: userId },
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error('Error generating excel file: ', error);
        throw error;
    }
};

const getBatchHistory = async() => {
    try {
        const response = await api.get('/batch/history');
        return response.data;
    } catch (error) {
        console.error('Error getting batch history: ', error);
        throw error;
    }
};

const getBatchDetails = async(batchId) => {
    try {
        const response = await api.get(`/batch/${batchId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting batch details: ', error);
        throw error;
    }
};

const confirmBatchPartial = async(batchId, payload, userId) => {
    try {
        const response = await api.put(`/batch/${batchId}/confirm`, payload, {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error confirming batch: ', error);
        throw error;
    }
};

const redownloadBatchExcel = async(batchId) => {
    try {
        const response = await api.get(`/batch/${batchId}/download`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error('Error re-downloading excel: ', error);
        throw error;
    }
};

export const operatorService = {
    getPayersResume,
    getDocumentsForBatchPreview,
    generateBatchExcel,
    getBatchHistory,
    getBatchDetails,
    confirmBatchPartial,
    redownloadBatchExcel
};