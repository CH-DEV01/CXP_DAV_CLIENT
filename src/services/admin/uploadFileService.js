import api from '../api';

export const uploadFileTwo = async(selectedFile, selectedPayerId, userID, onUploadProgress) => {

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

export const uploadFile = async(selectedFile, selectedPayerId, userID, termVersionId, onUploadProgress) => {

    if (!selectedFile || !selectedPayerId || !userID) {
        throw new Error('File, Payer ID, and User ID are required');
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('payerId', selectedPayerId);
    formData.append('userId', userID);
    formData.append('termVersionId', termVersionId);

    try {
        const response = await api.post('/archivos/upload-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                }
            },
        });

        // 1. Instanciamos el archivo en la memoria del navegador
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // 2. Extraemos el nombre dinámico que manda el backend en los headers (opcional)
        let fileName = 'Comprobante_Factoraje.pdf'; // Nombre por defecto
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2) {
                fileName = fileNameMatch[1];
            }
        }

        // 3. Creamos un enlace invisible, forzamos el clic para descargar y limpiamos
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Limpieza de memoria
        link.remove();
        window.URL.revokeObjectURL(url);

        return "Archivo procesado y reporte descargado exitosamente.";

    } catch (error) {
        // Manejo especial de errores cuando el responseType es 'blob'
        // Si el backend mandó un error de validación (texto plano), Axios lo envolvió en un Blob.
        if (error.response && error.response.data instanceof Blob) {
            // Leemos el contenido del Blob para extraer el mensaje original de Spring Boot
            const textError = await error.response.data.text();

            // Intenta parsear como JSON si tu backend manda errores en JSON, 
            // sino, lanza el texto directamente.
            try {
                const jsonError = JSON.parse(textError);
                throw new Error(jsonError.message || 'Error en la validación del archivo');
            } catch (e) {
                throw new Error(textError); // Error en texto plano (Ej: "Cupo excedido")
            }
        }

        throw error;
    }
};

export const getFinancialParams = async() => {
    try {
        const response = await api.get('/financial-params');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveFinancialParams = async(params) => {
    try {
        const response = await api.post('/financial-params', params);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Petición al backend para descargar la plantilla Excel oficial
 */
export const downloadOfficialTemplate = async() => {
    try {
        const response = await api.get('/archivos/descargar-plantilla', {
            responseType: 'blob' // Obligatorio para archivos binarios
        });

        // Crear una URL temporal en el navegador y forzar descarga
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Plantilla_Masivo_Davivienda.xlsx');
        document.body.appendChild(link);
        link.click();

        // Limpieza de memoria RAM del cliente
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error("Error descargando la plantilla de Excel", error);
        throw new Error("No se pudo descargar la plantilla en este momento.");
    }
};

/**
 * Petición al backend para descargar el manual de usuario en PDF
 */
export const downloadUserManual = async() => {
    try {
        const response = await api.get('/archivos/descargar-manual', {
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Manual_Usuario_Factoraje.pdf');
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error("Error descargando el manual de usuario", error);
        throw new Error("No se pudo descargar el manual de usuario en este momento.");
    }
};