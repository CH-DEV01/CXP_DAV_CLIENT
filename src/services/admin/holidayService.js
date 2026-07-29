import api from '../api';

export const holidayService = {
    getHolidays: async() => {
        try {
            return await api.get('/holidays');
        } catch (error) {
            console.error("Error al obtener los asuetos:", error);
            throw error;
        }
    },

    createHoliday: async(data) => {
        try {
            return await api.post('/holidays', data);
        } catch (error) {
            console.error("Error al crear asueto:", error);
            throw error;
        }
    },

    updateHoliday: async(id, data) => {
        try {
            return await api.put(`/holidays/${id}`, data);
        } catch (error) {
            console.error("Error al actualizar asueto:", error);
            throw error;
        }
    },

    deleteHoliday: async(id) => {
        try {
            return await api.delete(`/holidays/${id}`);
        } catch (error) {
            console.error("Error al eliminar asueto:", error);
            throw error;
        }
    }
};