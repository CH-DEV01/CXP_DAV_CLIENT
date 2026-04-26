import api from "../api";

const updateDocumentsSelected = async (payload) => {

    try {

        const requestData = {
            documentIds: payload.documentIds 
        };

        const response = await api.post(
            `/agreement/updateDocuments/${payload.agreementId}/${payload.status}/${payload.payerId}/${payload.authMode}/${payload.userId}`,
            requestData
        );

        return response;

    } catch (error) {

        console.error("Error updating document status:", error);
        throw error;

    }
}

const getAgreementsByPayerAndStatus = async (payerId, status) => {

    try {

        const response = await api.get(`/agreement/byPayer/${payerId}/${status}`);
        return response;

    } catch (error) {

        console.error("Error fetching agreements:", error);
        throw error;

    }
}

const getAgreementsBySupplierAndStatus = async (supplierId, status) => {

    try {

        const response = await api.get(`/agreement/bySupplier/${supplierId}/${status}`);
        return response;

    } catch (error) {

        console.error("Error fetching agreements:", error);
        throw error;

    }
}

const getAgreementsByStatus = async (status) => {

    const entityType = user.entity.entityType;

    if (entityType === true) {

        const payerId = user.entity.id;
        return await getAgreementsByPayerAndStatus(payerId, status);

    }

    if (entityType === false) {

        const supplierId = user.entity.id;
        return await getAgreementsBySupplierAndStatus(supplierId, status);

    }
}

const getAgreementsByPayer = async (payerId) => {

    try {

        const response = await api.get(`/agreement/byPayer/${payerId}`);
        return response;

    } catch (error) {

        console.error("Error fetching agreements by payer:", error);
        throw error;

    }
}

const getAgreementsBySupplier = async (supplierId) => {
    try {

        const response = await api.get(`/agreement/bySupplier/${supplierId}`);
        return response;

    } catch (error) {

        console.error("Error fetching agreements by supplier:", error);
        throw error;

    }
}

const getAgreements = async (user) => {

    const entityType = user.entityType;

    if (entityType === true) {

        const payerId = user.entityId;
        return await getAgreementsByPayer(payerId);

    } else {

        const supplierId = user.entityId;
        return await getAgreementsBySupplier(supplierId);

    }
}

const getAgreementById = async (agreementId) => {
    try {

        const response = await api.get(`/agreement/byId/${agreementId}`);
        return response;

    } catch (error) {

        console.error("Error fetching agreement by ID:", error);
        throw error;

    }
}

const approveDocumentsInBulk = async (payload) => {
    const response = await api.post('/agreement/bulk-approve', payload);
    return response.data;
};

export const agreementService = {

    getAgreementById,
    updateDocumentsSelected, 
    getAgreementsByPayerAndStatus,
    getAgreementsBySupplierAndStatus,
    getAgreementsByStatus, 
    getAgreementsByPayer,
    getAgreementsBySupplier,
    getAgreements,
    approveDocumentsInBulk

}