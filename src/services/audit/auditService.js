import api from '../api';

const saveAuditAcceptance = async({ ip, userAgent, userId, versionTermId }) => {

    const payload = {
        ip,
        userAgent,
        userId,
        versionTermId
    }

    try {
        const response = await api.post('/terms', payload);
        return response.data;
    } catch (error) {
        console.error('Error saving audit acceptance', error);
        throw error;
    }
};

const getLogsByDocumentId = async(documentId) => {
    try {
        const response = await api.get(`/logs/${documentId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting log document.', error);
        throw error;
    }
}

const getByActiveStatusSupplier = async() => {

    try {
        const response = await api.get('/term-versions/bySupplier');
        return response.data;
    } catch (error) {
        console.error('Error getting term version by supplier', error);
        throw error;
    }
};

const getByActiveStatusPayer = async() => {

    try {
        const response = await api.get('/term-versions/byPayer');
        return response.data;
    } catch (error) {
        console.error('Error getting term version by payer', error);
        throw error;
    }
};


export const auditService = {
    saveAuditAcceptance,
    getLogsByDocumentId,
    getByActiveStatusSupplier,
    getByActiveStatusPayer
};