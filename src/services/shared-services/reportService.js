import api from '../api';

/**
 * =========================================================================
 * FUNCIÓN UTILITARIA (PRIVADA) PARA DESCARGAR BLOBS
 * =========================================================================
 * Procesa el flujo binario de Axios y fuerza la descarga en el navegador.
 */
const triggerExcelDownload = async(response, defaultFilename) => {
    // 1. Extraer nombre del archivo desde los Headers si el backend lo envió,
    // de lo contrario usamos el nombre por defecto.
    let fileName = defaultFilename;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
            fileName = fileNameMatch[1];
        }
    }

    // 2. Crear el Blob con el tipo MIME exacto de Excel
    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 3. Crear URL temporal y forzar el clic
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // 4. Limpieza de memoria RAM del cliente
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * =========================================================================
 * MANEJO DE ERRORES PARA BLOBS
 * =========================================================================
 * Si falla, Axios envuelve el mensaje de error de Spring Boot en un Blob.
 */
const handleBlobError = async(error) => {
    if (error.response && error.response.data instanceof Blob) {
        const textError = await error.response.data.text();
        try {
            const jsonError = JSON.parse(textError);
            throw new Error(jsonError.message || 'Error al generar el reporte.');
        } catch (e) {
            throw new Error(textError || 'Error de conexión con el servidor.');
        }
    }
    throw error;
};

/**
 * =========================================================================
 * SERVICIOS EXPORTADOS PARA LOS COMPONENTES DE REACT
 * =========================================================================
 */

// 1. Descargar Histórico del Pagador
const downloadPayerHistoricalExcel = async(payerId) => {
    if (!payerId) throw new Error("El ID del pagador es requerido.");

    try {
        const response = await api.get(`/reports/excel/payer/${payerId}`, {
            responseType: 'blob'
        });
        await triggerExcelDownload(response, `Historico_Pagador_${payerId}.xlsx`);
        return true;
    } catch (error) {
        console.error("Error al descargar excel del pagador:", error);
        await handleBlobError(error);
    }
};

// 2. Descargar Histórico del Proveedor
const downloadSupplierHistoricalExcel = async(supplierId) => {
    if (!supplierId) throw new Error("El ID del proveedor es requerido.");

    try {
        const response = await api.get(`/reports/excel/supplier/${supplierId}`, {
            responseType: 'blob'
        });
        await triggerExcelDownload(response, `Historico_Proveedor_${supplierId}.xlsx`);
        return true;
    } catch (error) {
        console.error("Error al descargar excel del proveedor:", error);
        await handleBlobError(error);
    }
};

// 3. Descargar Consolidado Global (Administrador del Banco)
const downloadAdminConsolidatedExcel = async() => {
    try {
        const response = await api.get('/reports/excel/full-admin', {
            responseType: 'blob'
        });
        await triggerExcelDownload(response, 'Consolidado_Global_Admin.xlsx');
        return true;
    } catch (error) {
        console.error("Error al descargar excel consolidado:", error);
        await handleBlobError(error);
    }
};

export const reportService = {
    downloadPayerHistoricalExcel,
    downloadSupplierHistoricalExcel,
    downloadAdminConsolidatedExcel
}