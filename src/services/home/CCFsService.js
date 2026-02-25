import api from "../api";

export const getCCFs = async () => {
    try {

        const response = await api.get('/ccfs');
        return response;
    } catch (error) {
        console.error('Error fetching CCFs:', error);
        throw error;
    }
}

export const getCCFsSelected = async () => {
    try {
        const response = await api.get('/ccfs/selected');
        return response;
    } catch (error) {
        console.error('Error fetching selected CCFs:', error);
        throw error;
    }
}

export const updateCCFsSelected = async (payload) => {
    try {
        const response = await api.post('/ccfs/update-selected', payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating CCFs:', error);
        throw error;
    }
}

export const CCFsService = {
    getCCFs,
    updateCCFsSelected,
    getCCFsSelected
};

