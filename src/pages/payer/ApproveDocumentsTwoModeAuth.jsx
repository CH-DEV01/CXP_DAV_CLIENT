import SweetAlert from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { agreementService } from '../../services/shared-services/agreementService';
import Disclaimer from '../../components/Disclaimer';

const ApproveDocuments = () => {
    const [agreements, setAgreements] = useState([]);
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const { userData } = useAuth();

    useEffect(() => {
        const fetchAgreements = async () => {
            const response = await agreementService.getAgreements(userData);
            setAgreements(response.data);
        };
        fetchAgreements();
    }, [userData]);

    const getSelectedDocuments = () => {
    /* si por alguna razón agreements no es Array, devuelve [] */
    if (!Array.isArray(agreements)) return [];

        return agreements.reduce((acc, agr) => {
            if (!Array.isArray(agr.documents)) return acc;      // seguridad extra

            const docs = agr.documents
            .filter(doc => doc.status === "SELECTED")
            .map(doc => ({ ...doc, agreementId: agr.agreement_id }));

            return acc.concat(docs);    // equivalente a flatMap
        }, []);
    };


    useEffect(() => {
        const docs = getSelectedDocuments();
        setSelected(docs.map(d => d.document_id));
    }, [agreements]);

    const handleSelect = documentId => {
        setSelected(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const toggleSelectAll = () => {
        const allIds = getSelectedDocuments().map(d => d.document_id);
        setSelected(prev =>
            prev.length === allIds.length ? [] : allIds
        );
    };

    const formatDate = raw => {
        if (raw == null || raw === '') return 'N/A';
        let dateObj;
        if (typeof raw === 'number' || /^\d+$/.test(raw)) {
            const serial = Number(raw);
            const utcDays = serial - 25569;
            dateObj = new Date(utcDays * 86400 * 1000);
        } else {
            dateObj = new Date(raw);
        }
        return dateObj.toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const handleApproveAll = async () => {
        if (selected.length === 0) {
            return SweetAlert.fire(
                'No hay documentos seleccionados',
                'Por favor seleccione al menos un documento.',
                'warning'
            );
        }

        // Agrupar IDs seleccionados por agreementId
        const docs = getSelectedDocuments().filter(doc =>
            selected.includes(doc.document_id)
        );
        const groups = docs.reduce((acc, doc) => {
            acc[doc.agreementId] = acc[doc.agreementId] || [];
            acc[doc.agreementId].push(doc.document_id);
            return acc;
        }, {});

        const result = await SweetAlert.fire({
            title: 'Confirmar aprobación masiva',
            text: `¿Está seguro de aprobar ${selected.length} documento(s) de ${Object.keys(groups).length} convenio(s)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, aprobar todo',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                // Ejecutar una llamada por cada convenio
                try {
                    const promises = Object.entries(groups).map(
                        ([agreementId, documentIds]) =>
                            agreementService.updateDocumentsSelected({
                                agreementId : agrId,
                                status      : "APPROVED",
                                documentIds : data.ids,
                                payerId     : userData.entityId,
                                authMode: 2
                            })
                    );
                    await Promise.all(promises);

                } catch (error) {
                    SweetAlert.fire('Error', 'Ocurrió un error al aprobar.', 'error');
                    return Promise.reject();
                }
            }

        });

        if (result.isConfirmed) {
            setSelected([]);
            await SweetAlert.fire('¡Aprobados!', 'Todos los documentos han sido aprobados.', 'success');
            window.location.reload();
        }
    };

    const filteredDocuments = getSelectedDocuments().filter(doc => {
        const matchesSearch = doc.documentNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter
            ? doc.issueDate === dateFilter
            : true;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="p-6 bg-gray-100 h-screen pt-28 flex flex-col gap-6 font-montserrat">
            <div className="flex flex-row h-full gap-6">
                {/* Left Sidebar */}
                <div className="flex flex-col w-1/4 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="shadow-lg bg-gradient-to-r from-red-600 to-red-800 bg-red-800 text-white p-6 rounded-xl w-full text-center">
                            <div className="flex items-center justify-center gap-6">
                                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
                                        alt="Confirmation Icon"
                                        className="w-10 h-10"
                                    />
                                </div>
                                <p className="text-4xl font-bold drop-shadow-md">
                                    {filteredDocuments.length}
                                </p>
                            </div>
                            <p className="text-lg mt-2 font-medium">Documentos listos para desembolsar</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl justify-between h-full shadow-sm border border-gray-100 flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-600 mb-3">
                                    Buscar por número
                                </label>
                                <input
                                    type="text"
                                    placeholder="Buscar"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="block w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                                />
                            </div>
                        </div>

                        {/* <div>
                            <button
                                onClick={handleApproveAll}
                                className={`w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${selected.length > 0
                                    ? 'bg-red-700 hover:bg-red-800 cursor-pointer'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={selected.length === 0}
                            >
                                Aprobar seleccionados ({selected.length})
                            </button>
                        </div> */}
                    </div>
                </div>

                {/* Main Table Section */}
                <div className="flex flex-col w-3/4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider w-10">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selected.length > 0 &&
                                                    selected.length === filteredDocuments.length
                                                }
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                            Número de documento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                            Proveedor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                            Monto del documento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                            Fecha de emisión
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredDocuments.length > 0 ? (
                                        filteredDocuments.map(item => (
                                            <tr key={item.document_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(item.document_id)}
                                                        onChange={() => handleSelect(item.document_id)}
                                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {item.documentNumber || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    { item.supplierName || 'N/A' }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${item.amount?.toLocaleString() || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(item.issueDate)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No se encontraron documentos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-auto border-t border-gray-200">
                            <div className="flex items-center justify-between px-4 py-3 bg-white sm:px-6">
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando <span className="font-medium">1</span> a{' '}
                                            <span className="font-medium">{filteredDocuments.length}</span> de{' '}
                                            <span className="font-medium">{filteredDocuments.length}</span> documentos
                                        </p>
                                    </div>
                                    <div>
                                        <nav
                                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                            aria-label="Pagination"
                                        >
                                            <button
                                                disabled
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-300 cursor-not-allowed"
                                            >
                                                <span className="sr-only">Anterior</span>
                                                <svg
                                                    className="h-5 w-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                            <button className="relative inline-flex items-center px-4 py-2 border text-sm font-medium z-10 bg-red-50 border-red-500 text-red-600">
                                                1
                                            </button>
                                            <button
                                                disabled
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-300 cursor-not-allowed"
                                            >
                                                <span className="sr-only">Siguiente</span>
                                                <svg
                                                    className="h-5 w-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Disclaimer />
        </div>
    );
};

export default ApproveDocuments;
