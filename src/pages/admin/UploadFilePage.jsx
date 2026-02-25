import React, { useState, useEffect } from 'react';
import { uploadFile } from '../../services/admin/uploadFileService';
import { payerService } from '../../services/admin/payerService';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProgressBarCard from '../../components/ProgressBarCard';
import DisclaimerSupplierModal from '../../components/modals/DisclaimerSupplierModal.jsx';
import { HiOutlineDocumentText } from 'react-icons/hi';
import LimitExceeded from '../../components/LimitExceeded.jsx';
import PayerData from '../../components/PayerData.jsx';

const UploadFilePage = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ creditLineLevel, setCreditLineLevel ] = useState(70);
    const [isAccepted, setIsAccepted] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [selectedPayerId, setSelectedPayerId] = useState(null);
    const [payers, setPayers] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
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

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const allowedExcelTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
            'application/vnd.ms-excel'                                            
        ];

        if (allowedExcelTypes.includes(file.type)) {
            setSelectedFile(file);
            setUploadStatus('');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Formato de archivo no válido',
                text: 'Por favor, selecciona un archivo de Excel con formato .xlsx o .xls.',
                confirmButtonText: 'Entendido'
            });
            setSelectedFile(null);
            event.target.value = null;
        }
        setUploadStatus('');
    };

    const handleUpload = async () => {

        setIsUploading(true);
        setUploadStatus('Subiendo archivo...');

        if (!selectedFile) {
            setUploadStatus('Por favor selecciona un archivo primero');
            return;
        }

        // if (!selectedPayerId) {
        //     setUploadStatus('Por favor selecciona un pagador');
        //     return;
        // }

        setUploadStatus('Subiendo archivo...');

        try {

            await uploadFile(
                selectedFile,
                "c77b4255-7471-4ba0-a139-f1200a658d1c",
                // selectedPayerId,
                userData.id,
            );

            setUploadStatus('Archivo subido con éxito!');
            window.location.reload();

        } catch (error) {
            console.error('Error al subir archivo:', error);
            setUploadStatus('Error al subir el archivo. Por favor intenta nuevamente.');
            
        } finally {
            setIsUploading(false);
        }
    };

    const handleSelectPayer = (payerId) => {
        setSelectedPayerId(payerId === selectedPayerId ? null : payerId);
    };

    const handleAccept = () => {

        
        setIsModalOpen(false);

    };
  
    const openDisclaimer = () => {
        setIsModalOpen(true);
    }

    return (
        <div className="flex min-h-screen">

            <div className="mr-4 shadow-2xl w-full md:w-1/3 lg:w-1/4 bg-gradient-to-r from-red-600 to-red-800 bg-red-800 text-white p-4 rounded-xl overflow-y-auto font-montserrat">
                
                {/* <div className="space-y-3 mt-4 flex justify-center">
                    {payers.length === 0 ? (
                        <LoadingSpinner></LoadingSpinner>
                    ) : (
                        <div className="w-full space-y-3">
                            {payers.map((payer) => (
                                <div
                                    key={payer.id}
                                    onClick={() => handleSelectPayer(payer.id)}
                                    className={`p-4 md:flex md:flex-col  rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between
                    ${selectedPayerId === payer.id
                                            ? 'bg-red-100 border-l-4 border-red-500 text-gray-800'
                                            : 'bg-white hover:bg-red-50 text-gray-800'
                                        }`}
                                >
                                    <div className="md:flex md:w-full flex items-center space-x-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center 
                      ${selectedPayerId === payer.id ? 'bg-red-500' : 'bg-red-200'}`}>
                                            <span className={`font-medium ${selectedPayerId === payer.id ? 'text-white' : 'text-red-700'}`}>
                                                {payer.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className={`font-medium ${selectedPayerId === payer.id ? 'text-red-700' : 'text-gray-800'}`}>
                                                {payer.name}
                                            </h3>
                                            <div className="w-50">
                                                <p className={`break-words text-sm ${selectedPayerId === payer.id ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {payer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div> */}

                <PayerData></PayerData>

                {/* <div className="mt-4 mb-4 border-b-1 border-gray-100"></div> */}

                <ProgressBarCard progress={creditLineLevel} entity={"Hola"}></ProgressBarCard>
                
            </div>

            <div className="flex-1 font-montserrat min-h-screen">
                <div className="bg-white rounded-2xl shadow-lg  h-full flex flex-col justify-evenly border-2 border-gray-200">
                    <div className="mt-6 ml-6 mr-6">
                        {creditLineLevel >= 90 && <LimitExceeded></LimitExceeded>}
                    </div>
                    
                    <div className="w-2xl mx-auto">
                        <div className="">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-800">Centro de carga de datos</h1>
                                    <p className="text-gray-600 mt-2">Gestión de archivos para proceso de confirming</p>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-red-300 transition duration-200">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Subir archivo de datos</h3>
                                        <p className="mt-1 text-xs text-gray-500">Formatos soportados: .xlsx, .csv</p>
                                    </div>

                                    <div className="flex w-full gap-4">
                                        <div className="flex justify-center mt-6 w-full">
                                            <input
                                                id="file-upload"
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".xlsx,.csv"
                                                className="sr-only"
                                                disabled={isUploading || creditLineLevel >= 90}
                                            />

                                            <label
                                                htmlFor="file-upload"
                                                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                                    isUploading || creditLineLevel >= 90 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            >
                                                <span>Seleccionar archivo</span>
                                            </label>
                                        </div>
                                    </div>
                                    {selectedFile && (
                                        <div className="mt-4 p-3 bg-gray-100 rounded-md">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-900 truncate">{selectedFile.name}</span>
                                                <span className="text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <button
                                            className={`cursor-pointer w-full mt-4 rounded-2xl bg-red-600 px-4 py-1 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center ${
                                                creditLineLevel >= 90 || selectedFile == null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                            }`}
                                            onClick={openDisclaimer}
                                            disabled={creditLineLevel >= 90 || selectedFile == null}
                                        >
                                            <HiOutlineDocumentText className="h-4 w-4 mr-2" />
                                            Ver términos y condiciones 
                                        </button>
                                    </div>

                                        <div className="mt-2 w-full">
                                            <button
                                                onClick={handleUpload}
                                                disabled={ isUploading || !isAccepted}
                                                className={`cursor-pointer w-full py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                                    (!isAccepted || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Procesando...</span>
                                                    </>
                                                ) : (
                                                    'Procesar archivo'
                                                )}
                                            </button>

                                            {uploadStatus && (
                                                <div className={`mt-3 p-3 rounded-md text-sm ${uploadStatus.includes('éxito') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {uploadStatus}
                                                </div>
                                            )}
                                        </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Última actualización: {new Date().toLocaleDateString()} | Versión 1.0.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DisclaimerSupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Términos y Condiciones aplicables al Servicio Bancario para la Gestión y Anticipo de Pago a Proveedores</h2>

                <div className="text-gray-700 mb-6 max-h-72 overflow-y-auto pr-4 text-sm space-y-3">
                    <p>
                        Al continuar con esta operación, usted (en adelante, "el Proveedor") reconoce, declara y acepta de manera expresa e irrevocable los siguientes Términos y Condiciones aplicables al Servicio Bancario para la Gestión de pago o Anticipo de Pago a Proveedores (en adelante, “Servicio de Anticipo de Pago”), solicitado a través de este sistema (en adelante, "la Plataforma"), brindado por Banco Davivienda Salvadoreño, Sociedad Anónima (en adelante, el “Banco”).
                    </p>
                    <p>
                        Para efectos de estos términos, se entenderá por “Cliente Pagador” la persona natural o jurídica a cuyo cargo fue emitida la cuenta por cobrar (factura, comprobante de crédito fiscal (CCF), DTE y/o cualquier otro documento tributario ), en adelante “Cuentas por Cobrar” respecto de las cuales el Proveedor puede optar voluntariamente por solicitar el anticipo de pago:
                    </p>
                    
                    <p>
                        <strong>1. Visualización y solicitud voluntaria.</strong> El Proveedor reconoce que, al acceder a la Plataforma, podrá visualizar las Cuentas por Cobrar registradas a su favor por el Cliente Pagador, y que tendrá la opción de solicitar, de manera voluntaria, el Servicio de Anticipo de Pago sobre dichas Cuentas por Cobrar.
                    </p>

                    <p>
                        <strong>2. Naturaleza del pago anticipado.</strong> En caso de optar por la solicitud del Servicio de Anticipo de Pago de alguna de las Cuentas por Cobrar registradas por el Cliente Pagador a su favor, el Proveedor reconoce y acepta que, el pago anticipado que ejecuta el banco se realiza por cuenta, orden y a cargo del Cliente Pagador, entendiéndose por tal la persona natural o jurídica a cuyo cargo fue emitida la Cuenta por Cobrar respecto de la cual se solicita el anticipo, todo ello en ejecución del mandato de anticipo de pago otorgado por dicho Cliente Pagador al Banco.
                    </p>

                    <p>
                        <strong>3. Validez y exigibilidad de las Cuentas por Cobrar.</strong> El Proveedor declara que las Cuentas por Cobrar respecto de las cuales solicite el Servicio de Anticipo de Pago:<br />
                        a. corresponden a obligaciones válidas, exigibles y no controvertidas frente al Cliente Pagador;<br />
                        b. no se encuentran sujetas a reclamaciones, disputas, compensaciones, devoluciones, anulaciones ni cualquier otra circunstancia que pueda afectar su existencia, exigibilidad o monto; y<br />
                        c. no han sido total ni parcialmente saldadas con anterioridad.
                    </p>

                    <p>
                        <strong>4. Titularidad y libre disposición de las Cuentas por Cobrar.</strong> El Proveedor declara además que las Cuentas por Cobrar respecto de las cuales solicite el Servicio de Anticipo de Pago:<br />
                        a. son de titularidad legítima y exclusiva del Proveedor; y<br />
                        b. se encuentran libres de gravámenes, retenciones, cesiones o transferencias previas a terceros, y no se encuentran sujetas a limitaciones de disposición de ninguna naturaleza.
                    </p>

                    <p>
                        <strong>5. No sometimiento a disputas posteriormente a la solicitud del Servicio de Anticipo de Pago.</strong> Una vez solicitado el Servicio de Anticipo de Pago de una Cuenta por Cobrar a favor del Proveedor y ejecutado el pago anticipado por el Banco, el Proveedor se compromete a no someter dichas Cuentas por Cobrar a compensación, reclamo, disputa comercial o judicial.
                    </p>

                    <p>
                        <strong>6. Conservación de la relación comercial.</strong> El Proveedor acepta que el pago anticipado ejecutado por el Banco en virtud del Servicio de Anticipo de Pago, no constituye cesión de créditos y que el Banco no adquiere la titularidad de las Cuentas por Cobrar ni se convierte en su cesionario, manteniéndose íntegra la relación jurídica existente entre el Proveedor y el Cliente Pagador. El Proveedor reconoce que la operación únicamente genera a favor del Banco un derecho de reembolso frente al Cliente Pagador por los montos desembolsados en su nombre.
                    </p>

                    <p>
                        <strong>7. Comisión e Intereses por el servicio.</strong> El Proveedor reconoce y acepta de las Cuentas por Cobrar de las cuales solicite el Servicio de Anticipo de Pago, el Banco ejecutará el pago anticipado por la totalidad del importe de cada Cuenta por Cobrar; no obstante, reconoce y acepta pagar al Banco una comisión como remuneración por la gestión y ejecución del Servicio de Anticipo de Pago, la cual se devengará y será exigible al momento en que el Banco efectúe el desembolso del anticipo, y será cobrada por el Banco de forma separada, conforme a los mecanismos operativos que éste determine, los cuales el proveedor verá reflejado en la plataforma previo al envío de solicitud de pago.
                        <br /><br />
                        El interés que generará el anticipo de las cuentas por pagar será del ______ PUNTO _____POR CIENTO ______% y podrá ajustarse de manera quincenal a opción el Banco los días: uno y quince de cada uno de los meses comprendidos dentro del plazo y también de conformidad a la tasa de referencia que el banco mensualmente publica. La tasa de referencia correspondiente a este mes es del _____ PUNTO ______ por ciento, la que en sus publicaciones podrá ajustarse a opción del Banco; y el diferencial máximo que el banco podrá aplicar a este crédito durante toda su vigencia y mientras existan saldos pendientes será de ______ puntos porcentuales arriba de la tasa de referencia vigente a la fecha de cada modificación.
                    </p>

                    <p>
                        <strong>8. Consentimiento.</strong> El Proveedor reconoce que la aceptación de estos Términos y Condiciones aplicables al Servicio Bancario para la Gestión y Anticipo de Pago a Proveedores y las solicitudes del Servicio de Anticipo de Pago de alguna de las Cuentas por Cobrar registradas a su favor que realice a través de la Plataforma, constituyen una manifestación expresa de su consentimiento.
                    </p>

                    <p>
                        <strong>9. Limitación de responsabilidad del Banco.</strong> El Proveedor acepta que en le ejecución del Servicio de Anticipo de Pago, el Banco actúa exclusivamente como mandatario del Cliente Pagador y que el Banco no asume responsabilidad alguna por la relación comercial entre el Proveedor y el Cliente Pagador, ni por reclamos, disputas o incumplimientos que pudieren surgir entre ellos.
                    </p>

                    <p>
                        <strong>10. Legislación Aplicable y Jurisdicción.</strong> Para todos los efectos legales, que se puedan originar del Servicio de Anticipo de Pago, el Proveedor manifiesta que se regirán por las leyes de la República de El Salvador. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes del distrito de San Salvador, municipio de San Salvador Centro, departamento de San Salvador.
                    </p>
                </div>

                <div className="flex items-start mb-6">
                    <input
                        id="accept-checkbox"
                        type="checkbox"
                        checked={isAccepted}
                        onChange={() => setIsAccepted(!isAccepted)}
                        className="cursor-pointer w-4 h-4 mt-1 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 shrink-0"
                    />
                    <label htmlFor="accept-checkbox" className="ml-3 text-sm font-medium text-gray-900">
                        Declaro que he leído, comprendido y acepto irrevocablemente estos Términos y Condiciones aplicables al Servicio Bancario para la Gestión y Anticipo de Pago a Proveedores.
                    </label>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="cursor-pointer px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleAccept}
                        disabled={!isAccepted}
                        className="cursor-pointer px-5 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-red-700"
                    >
                        Confirmar solicitud
                    </button>
                </div>
            </DisclaimerSupplierModal>
        </div>
    );
};

export default UploadFilePage;