import api from "../api";

// CREATE
export const createPayer = async(payload) => {

    console.log("Payload recibido desde el formulario:", payload);

    try {
        // 1. Convertimos el valor de texto a booleano (true o false)
        // Nota: Asegúrate de que 'T_MAS_1' sea exactamente el valor (value) que le pusiste a tu radio button en el formulario.
        const esTipoTMas1 = payload.tipo_desembolso === 'T_MAS_1';

        const data = {
            "code": payload.codigo,
            "name": payload.nombre,
            "nit": payload.nit,
            "creditLineNumber": payload.numero_linea_credito,
            "paymentPolicy": payload.politica_pago,
            "interestRate": payload.tasa_interes,
            "commissionRate": payload.tasa_comision,
            "calculationBase": payload.base_calculo,
            "niu": payload.niu,
            "entityType": true,
            // 2. Asignamos la variable booleana que acabamos de calcular
            "disbursementMethod": esTipoTMas1
        }

        console.log("Datos formateados listos para la API:", data);

        const response = await api.post('/entities/create', data);
        return response;

    } catch (error) {

        console.error('Error saving payer:', error);
        throw error;

    }
}

// READ ALL
export const getEntities = async() => {
    try {

        const response = await api.get('/entities/type', {
            // 2. Agregamos el objeto params
            params: {
                isEntityType: true
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching payers:', error);
        throw error;
    }
}

export const getSuppliers = async() => {
    try {

        const response = await api.get('/entities/type', {

            params: {
                isEntityType: false
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
}

export const getTotalEntities = async() => {
    try {
        const [payersResponse, suppliersResponse] = await Promise.all([
            getEntities(),
            getSuppliers()
        ]);

        const payers = payersResponse.data;
        const suppliers = suppliersResponse.data;

        const allEntities = [...payers, ...suppliers];

        return allEntities;

    } catch (error) {
        console.error('Error fetching total entities:', error);
        throw error;
    }
}

// UPDATE
export const updatePayer = async(id, payload) => {
    try {

        const esTipoTMas1 = payload.tipo_desembolso === 'T_MAS_1';

        const data = {
            "code": payload.codigo,
            "name": payload.nombre,
            "nit": payload.nit,
            "creditLineNumber": payload.numero_linea_credito,
            "paymentPolicy": payload.politica_pago,
            "interestRate": payload.tasa_interes,
            "commissionRate": payload.tasa_comision,
            "calculationBase": payload.base_calculo,
            "niu": payload.niu,
            "entityType": true,
            "disbursementMethod": esTipoTMas1
        }

        const response = await api.put(`/entities/${id}`, data);

        return response.data;

    } catch (error) {

        console.error('Error updating payer', error);
        throw error;

    }
}

export const updateSupplier = async(id, payload) => {
    try {

        const data = {
            "code": payload.codigo,
            "name": payload.nombre,
            "nit": payload.nit,
            "niu": payload.niu,
            "accountBank": payload.cuenta_bancaria
        }

        const response = await api.put(`/entities/supplier/${id}`, data);

        return response.data;

    } catch (error) {

        console.error('Error updating supplier', error);
        throw error;

    }
}

// DELETE
export const deletePayer = async(id) => {
    try {

        const response = await api.delete(`entities/${id}`);

        return response;

    } catch (error) {

        console.error('Error deleting payer', error);
        throw error;

    }
}

const getEntityById = async(entityId) => {

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

const getNextDisbursementDate = async(entityId) => {

    try {
        const response = await api.get(`/entities/${entityId}/next-disbursement-date`);
        return response;
    } catch (error) {
        console.error("Error getting next disbursement date:", error);
        throw error;
    }
}

export const entityService = {
    createPayer,
    getNextDisbursementDate,
    getEntities,
    getSuppliers,
    updatePayer,
    updateSupplier,
    deletePayer,
    getEntityById,
    getTotalEntities
};