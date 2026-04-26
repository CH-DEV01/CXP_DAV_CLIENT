import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiTrashCanOutline } from '@mdi/js';
import { agreementService } from '../../services/admin/agreementService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Swal from 'sweetalert2'; 

const ViewAgreements = () => {
    const [agreements, setAgreements] = useState([]);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        const fetchAgreements = async () => {
            try {
                const response = await agreementService.getAgreements();
                if (response.status === 200) {
                    setAgreements(response.data);
                    if (response.data.length > 0) {
                        setSelectedAgreement(response.data[0]);
                    }
                } else {
                    console.error('Error fetching agreements:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching payers:', error);
            }
        };
        fetchAgreements();
    }, []);

    const handleSelectAgreement = (agreement) => {
        setSelectedAgreement(agreement);
    };

    const handleDeleteDocument = (documentId) => {
        Swal.fire({
            title: "¿Eliminar documento?",
            text: "¡No se podrá revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await agreementService.deleteDocument(documentId);
                    if (response.status === 204) {
                        Swal.fire(
                            '¡Eliminado!',
                            'El documento ha sido eliminado con éxito.',
                            'success',
                        ).then(() => {
                            window.location.reload()
                        })
                        
                    }
                } catch (error) {
                    console.error('Error deleting document:', error);
                    Swal.fire(
                        'Error',
                        'No se pudo eliminar el documento. Intenta de nuevo.',
                        'error'
                    );
                }
            }
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 pt-20">
            <div className="flex flex-col lg:flex-row w-full p-6 gap-6 flex-grow overflow-hidden">
                <div className="w-full lg:w-1/3 bg-white shadow-sm rounded-2xl p-4 border-2 border-gray-200 flex flex-col">
                    <h2 className="text-md font-montserrat font-bold text-gray-700 mb-4 px-2 flex-shrink-0">Seleccione una orden de pago</h2>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <div className="flex flex-col gap-2">
                            {agreements.map((agreement) => (
                                <button
                                    key={agreement.agreement_id}
                                    onClick={() => handleSelectAgreement(agreement)}
                                    className={`cursor-pointer w-full text-left p-3 rounded-lg transition duration-200 ${
                                        selectedAgreement?.agreement_id === agreement.agreement_id
                                            ? 'bg-red-600 text-white shadow'
                                            : 'hover:bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <span className="font-montserrat">{agreement.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 bg-white shadow-sm rounded-2xl p-6 border-2 border-gray-200 flex flex-col">
                    {selectedAgreement ? (
                        <>
                            <div className="overflow-auto flex-grow">
                                <table className="w-full leading-normal">
                                    <thead>
                                        <tr className="bg-white text-gray-700 uppercase text-sm">
                                            <th className="py-3 px-6 text-left">Nº Documento</th>
                                            <th className="py-3 px-6 text-center">Monto</th>
                                            <th className="py-3 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedAgreement.documents.map((doc, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-indigo-50">
                                                <td className="py-3 px-6 text-left">{doc.documentNumber}</td>
                                                <td className="py-3 px-6 text-center">${parseFloat(doc.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-3 px-6 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteDocument(doc.document_id)}
                                                        className="text-gray-400 hover:text-red-600 p-2 rounded-full transition duration-200"
                                                        title="Eliminar documento"
                                                    >
                                                        <Icon path={mdiTrashCanOutline} size={1} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <LoadingSpinner></LoadingSpinner>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAgreements;