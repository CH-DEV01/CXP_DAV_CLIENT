import api from '../api';

export const uploadFileTwo = async (selectedFile, selectedPayerId, userID, onUploadProgress) => {

    if (!selectedFile || !selectedPayerId || !userID) {
        throw new Error('File, Payer ID, and User ID are required');
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('payerId', selectedPayerId);
    formData.append('userId', userID);

    try {
        const response = await api.post('/archivos/upload-excel-two', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                }
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadFile = async (selectedFile, selectedPayerId, userID, onUploadProgress) => {

    if (!selectedFile || !selectedPayerId || !userID) {
        throw new Error('File, Payer ID, and User ID are required');
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('payerId', selectedPayerId);
    formData.append('userId', userID);

    try {
        const response = await api.post('/archivos/upload-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                }
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getFinancialParams = async () => {
    try {
        const response = await api.get('/financial-params');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveFinancialParams = async (params) => {
    try {
        const response = await api.post('/financial-params', params);
        return response.data;
    } catch (error) {
        throw error;
    }
};