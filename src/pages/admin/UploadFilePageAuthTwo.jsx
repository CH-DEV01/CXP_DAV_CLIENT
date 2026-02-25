import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiClockOutline } from '@mdi/js';
import { uploadFileTwo } from '../../services/admin/uploadFileService';
import { payerService } from '../../services/admin/payerService';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import Disclaimer from '../../components/Disclaimer';


const UploadFilePageAuthTwo = () => {

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedPayerId, setSelectedPayerId] = useState(null);
    const [payers, setPayers] = useState([]);
    const { userData } = useAuth();

    useEffect(() => {
        const fetchPayers = async () => {
            try {
                const response = await payerService.getEntities();
                if (response.status === 200) {
                    setPayers(response.data);
                } else {
                    console.error('Error fetching payers:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching payers:', error);
            }
        };
        fetchPayers();
    }, []);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus('');
        setUploadProgress(0);
    };

    const handleUpload = async () => {

        if (!selectedFile) {
            setUploadStatus('Por favor selecciona un archivo primero');
            return;
        }

        setUploadStatus('Subiendo archivo...');
        setUploadProgress(0);

        try {
            await uploadFileTwo(
                selectedFile,
                userData.entityId,
                userData.id,
                (progress) => setUploadProgress(progress)
            );

            setUploadStatus('Archivo subido con éxito!');

            if (uploadProgress === 100) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'El archivo fue subido correctamente',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    setSelectedFile(null);
                    setUploadProgress(0);
                    setUploadStatus('');
                    window.location.reload(); 
                });
            }   

        } catch (error) {
            console.error('Error al subir archivo:', error);
            setUploadStatus('Error al subir el archivo. Por favor intenta nuevamente.');
            setUploadProgress(0);
        }
    };

    const handleSelectPayer = (payerId) => {
        setSelectedPayerId(payerId === selectedPayerId ? null : payerId);
    };

    const formattedDate = currentTime.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const formattedTime = currentTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <div className="flex h-screen bg-gray-100 pt-20">

            {/* <div className="w-full md:w-1/3 lg:w-1/4 m-8 bg-red-800 text-white p-4 rounded-xl shadow-lg overflow-y-auto">
                <div className="sticky top-0 bg-red-800 pb-4 z-10">
                    <h2 className="text-xl font-bold mb-2">Lista de Pagadores</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar pagador..."
                            className="w-full p-2 rounded-md bg-red-900 text-white placeholder-red-300 border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <svg className="absolute right-3 top-2.5 h-5 w-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-3 mt-2">
                    {payers.map((payer) => (
                        <div
                            key={payer.id}
                            onClick={() => handleSelectPayer(payer.id)}
                            className={`p-4 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between
            ${selectedPayerId === payer.id
                                    ? 'bg-red-100 border-l-4 border-red-500'
                                    : 'bg-white hover:bg-red-50'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                ${selectedPayerId === payer.id ? 'bg-red-500' : 'bg-red-200'}`}>
                                    <span className={`font-medium ${selectedPayerId === payer.id ? 'text-white' : 'text-red-700'}`}>
                                        {payer.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className={`font-medium ${selectedPayerId === payer.id ? 'text-red-700' : 'text-gray-800'}`}>
                                        {payer.name}
                                    </h3>
                                    <p className={`text-sm ${selectedPayerId === payer.id ? 'text-red-600' : 'text-gray-500'}`}>
                                        {payer.email}
                                    </p>
                                </div>
                            </div>

                            <div className={`px-3 py-1 rounded-full text-sm font-medium
            ${selectedPayerId === payer.id
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {selectedPayerId === payer.id ? '✓ Seleccionado' : 'Seleccionar'}
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}

            <div className="flex-1 m-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col justify-evenly border-2 border-gray-200">

                    <div className="w-2xl mx-auto">
                        <div className="">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-800">Centro de carga de datos</h1>
                                    <p className="text-gray-600 mt-2">Gestión de archivos para proceso de factoraje</p>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-red-300 transition duration-200">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Subir archivo de datos</h3>
                                        <p className="mt-1 text-xs text-gray-500">Formatos soportados: .xlsx, .csv</p>
                                    </div>

                                    <div className="mt-6">
                                        <input
                                            id="file-upload"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".xlsx,.csv"
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                                        >
                                            <span>Seleccionar archivo</span>
                                        </label>

                                        {selectedFile && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-gray-900 truncate">{selectedFile.name}</span>
                                                    <span className="text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedFile}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        Procesar archivo
                                    </button>

                                    {uploadProgress > 0 && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Progreso:</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {uploadStatus && (
                                        <div className={`mt-3 p-3 rounded-md text-sm ${uploadStatus.includes('éxito') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {uploadStatus}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 mb-8">
                                <p className="text-xs text-gray-500">
                                    Última actualización: {new Date().toLocaleDateString()} | Versión 1.0.0
                                </p>
                            </div>
                            <Disclaimer></Disclaimer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadFilePageAuthTwo;