import api from "../api";

const getEntityById = async (entityId) => {

    try {
        const response = await api.get(`/entities/${entityId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error("Error getting entity:", error);
        throw error;
    }
}

export const entityService = {
    getEntityById
};