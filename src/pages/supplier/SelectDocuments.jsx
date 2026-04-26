import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiCashFast } from '@mdi/js';
import Swal from 'sweetalert2';
import {  mdiKeyboardReturn } from '@mdi/js';
import getISOWeekOfMonth from '../../utils/getISOWeekOfMonth.js';
import FinancingDaysCard from '../../components/Home/FinancingDaysCard.jsx';
import FinancingSummaryCard from '../../components/Home/FinancingSummaryCard.jsx';
import formatNumber from '../../utils/formatNumber.js';
import WelcomeBannerCard from '../../components/Home/WelcomeBannerCard.jsx';
import CardDisbursementDate from '../../components/Home/CardDisbursementDate.jsx';
import ItemsSelectedCard from '../../components/Home/ItemsSelectedCard.jsx';
import { agreementService } from '../../services/shared-services/agreementService.js';
import { useAgreement } from '../../context/AgreementContext.jsx';
import { operationsService } from '../../services/operations/operationsService.js';
import { entityService } from '../../services/admin/entityService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DisclaimerSupplierModal from '../../components/modals/DisclaimerSupplierModal.jsx';
import SupplierData from '../../components/SupplierData.jsx';

import {
    FINANCING,
    AUTH_MODES,
    DOCUMENT_STATUS
} from '../../constants/parameters';

const SelectDocuments = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalCommissions, setTotalCommissions] = useState(0);
    const [totalAmountToBeDisbursed, setTotalAmountToBeDisbursed] = useState(0);
    const [totalAmountToFinance, setTotalAmountToFinance] = useState(0);
    const [totalInterests, setTotalInterests] = useState(0);
    const [step, setStep] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [disbursementDate, setDisbursementDate] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [accountsPayable, setAccountsPayable] = useState([]);
    const [details, setDetails] = useState([]);
    const [ nit, setNit ] = useState("");
    const [ bankAccount, setBankAccount ] = useState("");
    const [ code, setCode ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ entityName, setEntityName ] = useState("");

    const [supplierEntity, setSupplierEntity] = useState(null);

    const { userData } = useAuth();

    const { agreement, saveAgreement } = useAgreement();

    const handleAccept = () => {
        save();
        setIsModalOpen(false);
        // Reinicia el checkbox para la próxima vez
        setIsAccepted(false); 
    };
  
    const openDisclaimer = () => {
        setIsAccepted(false); // Asegúrate de que el checkbox esté desmarcado al abrir
        setIsModalOpen(true);
    }

    const serialToDateObject = (serial) => {

        const utcDays = Math.floor(serial);
        const date = new Date(Date.UTC(1900, 0, 1));
        date.setUTCDate(date.getUTCDate() + utcDays);

        if (serial > 59) {
            date.setUTCDate(date.getUTCDate() - 1);
        }

        return date;
    };

    useEffect(() => {
        const loadEntity = async () => {
            try {
                const entity = await entityService.getEntityById(agreement.supplier);
                if (entity.status === 200) {
                    setSupplierEntity(entity.data);
                }
            } catch (error) {
                console.error("Error loading entity:", error);
            }
        };

        loadEntity();
    }, []);

    // useEffect(() => {
    //     const loadAgreement = () => {
    //         try {

    //             const uploadedDocuments = agreement.documents.filter(doc => doc.status === DOCUMENT_STATUS.APPROVED);

    //             const mappedAccounts = uploadedDocuments.map(ccf => ({
    //                 id: ccf.document_id || ccf.documentNumber || ccf.numeroQuedan || ccf.numeroDTE,
    //                 title: ccf.proveedor || "Proveedor no especificado",
    //                 concept: ccf.concepto || "Concepto no especificado",
    //                 amount: ccf.amount || 0,
    //                 checked: true,
    //                 CCF: ccf.documentNumber || '',
    //                 issueDate: serialToDateObject(ccf.issueDate),
    //                 disbursementDate: null,
    //                 dueDate: null,
    //                 selectedDate: new Date(),
    //                 nit: ccf.nit || '',
    //                 email: ccf.correoProveedor || '',
    //                 quedanNumber: ccf.numeroQuedan || '',
    //                 accountNumber: ccf.numeroCuentaDavivienda || '',
    //                 providerCode: ccf.codigoProveedor || '',
    //                 dteNumber: ccf.numeroDTE || '',
    //                 individualInterest: 0,
    //                 originalDocument: ccf,
    //                 financingDays: 0
    //             }));

    //             setAccountsPayable(mappedAccounts);
    //             calculateNextFriday();

    //         } catch (error) {
    //             console.error("Error parsing agreement:", error);
    //             Swal.fire({
    //                 title: "Error",
    //                 text: "No se pudo cargar la información del convenio",
    //                 icon: "error"
    //             });
    //         }
    //     };

    //     if (agreement?.documents) {
    //         loadAgreement();
    //     }
    // }, [agreement]);

    useEffect(() => {
    const isBlocked = (date) => {
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + 60);
        const hoy = new Date();
        const diff = (dueDate - hoy) / (1000 * 60 * 60 * 24);
        return diff <= 5;
    };

    const loadAgreement = () => {
        try {
            const uploadedDocuments = agreement.documents.filter(
                doc => doc.status === DOCUMENT_STATUS.APPROVED
            );

            const mappedAccounts = uploadedDocuments.map(ccf => {
                // Primero procesamos la fecha y la validación
                const issueDateObj = serialToDateObject(ccf.issueDate);
                const disabled = isBlocked(issueDateObj);

                // Luego retornamos el objeto completo
                return {
                    id: ccf.document_id || ccf.documentNumber || ccf.numeroQuedan || ccf.numeroDTE,
                    title: ccf.proveedor || "Proveedor no especificado",
                    concept: ccf.concepto || "Concepto no especificado",
                    amount: ccf.amount || 0,
                    checked: !disabled, // <--- Solo marcado si NO está bloqueado
                    CCF: ccf.documentNumber || '',
                    issueDate: issueDateObj,
                    disbursementDate: null,
                    dueDate: null,
                    selectedDate: new Date(),
                    nit: ccf.nit || '',
                    email: ccf.correoProveedor || '',
                    quedanNumber: ccf.numeroQuedan || '',
                    accountNumber: ccf.numeroCuentaDavivienda || '',
                    providerCode: ccf.codigoProveedor || '',
                    dteNumber: ccf.numeroDTE || '',
                    individualInterest: 0,
                    originalDocument: ccf,
                    financingDays: 0
                };
            });

            setAccountsPayable(mappedAccounts);
            calculateNextFriday();

        } catch (error) {
            console.error("Error parsing agreement:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo cargar la información del convenio",
                icon: "error"
            });
        }
    };

    if (agreement?.documents) {
        loadAgreement();
    }
}, [agreement]);

    useEffect(() => {
        if (supplierEntity) {
            setNit(supplierEntity.nit || 'N/A');
            setBankAccount(supplierEntity.accountBank || 'N/A'); // Asumiendo que se llama 'accountBank' en tu objeto
            setEmail(supplierEntity.email || 'N/A');
            setCode(supplierEntity.code || 'N/A'); // Asumiendo que se llama 'code'
            setEntityName(supplierEntity.name || 'N/A');
        }
    }, [supplierEntity]); // Esta es la dependencia

    const calculateNextFriday = useCallback(() => {
        const today = new Date();
        const nextFriday = new Date(today);
        //nextFriday.setDate(today.getDate() + 1);
        nextFriday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);
        setDisbursementDate(nextFriday);
        return nextFriday;
    }, []);

    const oneDayMs = 24 * 60 * 60 * 1000;

    function daysBetween(a, b) {
        const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.round((utcB - utcA) / oneDayMs);
    }

    const calculateInterests = useCallback(async () => {

        const nextFriday = disbursementDate || calculateNextFriday();
        const daysFinancing = FINANCING.DAYS;

        const payload = accountsPayable
            .filter(item => item.checked)
            .map(item => {
                const issueDate = new Date(item.issueDate);
                const cutOffDate = new Date(issueDate);
                cutOffDate.setDate(cutOffDate.getDate() + daysFinancing);

                const diffDays = daysBetween(nextFriday, cutOffDate);
                item.financingDays = diffDays;

                return { issueDate: issueDate, diffDays, amount: item.amount, documentNumber: item.CCF, cutOffDate: cutOffDate, documentID: item.id };
            });

        if (payload.length > 0) {
            try {
                const response = await operationsService.calculateInterests(payload);
                setTotalInterests(response.interests || 0);
                setTotalCommissions(response.commissions || 0);
                setTotalAmountToBeDisbursed(response.amountToBeDisbursed || 0);
                setTotalAmountToFinance(response.amountToFinance || 0);

                setDetails(response.detail || []);
            } catch (apiError) {
                console.error('Error en API calcular intereses:', apiError);
            }
        }

    }, [accountsPayable, disbursementDate, calculateNextFriday]);


    useEffect(() => {
        const hasSelection = accountsPayable.some(item => item.checked);

        if (hasSelection) {
            calculateInterests();
        } else {
            setTotalInterests(0);
            setTotalCommissions(0);
            setTotalAmountToBeDisbursed(0);
            setTotalAmountToFinance(0);
            setDetails([]);
        }
    }, [accountsPayable]);

    useEffect(() => {
        const total = accountsPayable.reduce((sum, item) =>
            item.checked ? sum + (item.amount || 0) : sum, 0);
        setTotalAmount(total);

    }, [accountsPayable]);


    const nextStep = () => {
        calculateInterests();
        setStep(2);
    };

    const prevStep = () => {
        setStep(1);
    };

    const handleCheckboxChange = (itemId) => {
        setAccountsPayable(prev => prev.map(item => {
            if (item.id === itemId) {
                const newCheckedState = !item.checked;
                return {
                    ...item,
                    checked: newCheckedState,
                    lastSelected: newCheckedState ? new Date().toISOString() : null
                };
            }
            return item;
        }));
    };

    const calculatePercentage = () => {
        if (totalAmount <= 0) return '0.00';

        const result = ((totalAmount - (totalAmount * 0.0055) - totalInterests) / totalAmount) * 100;
        return formatNumber(result) || '0.00';
    };

    const guardarDatos = async () => {
        try {
            const selectedIds = accountsPayable
                .filter(item => item.checked)
                .map(item => item.id);

            if (selectedIds.length === 0) {
                throw new Error("No hay elementos seleccionados para guardar");
            }

            const payload = {
                agreementId: agreement.agreement_id,
                documentIds: selectedIds,
                status: DOCUMENT_STATUS.SELECTED,
                payerId: agreement.payer,
                userId: userData.id,
                authMode: AUTH_MODES.SINGLE_MODE
            };

            const response = await agreementService.updateDocumentsSelected(payload);

            const { data } = await agreementService.getAgreementById(agreement.agreement_id);
            saveAgreement(data); 

            return response;
        } catch (error) {
            console.error('Error al guardar los datos:', error);
            throw error;
        }
    };

    const save = async () => {

        try {
            Swal.fire({
                title: "Procesando solicitud",
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false
            });

            await guardarDatos();

            setAccountsPayable(prev => prev.map(item =>
                item.checked ? { ...item, checked: false } : item
            ));
            
            setStep(1);

            Swal.fire({
                title: "Éxito",
                text: "La solicitud se ha efectuado correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.message || "Ocurrió un error al procesar la solicitud",
                icon: "error"
            });
        }

        // const result = await Swal.fire({
        //     title: "Guardar cambios",
        //     text: "¿Estás seguro de que desea guardar los cambios?",
        //     icon: "info",
        //     showCancelButton: true,
        //     confirmButtonText: "Guardar",
        //     cancelButtonText: "Cancelar",
        //     confirmButtonColor: "#8B0000",
        //     cancelButtonColor: "#6b7280",
        //     iconColor: "#8B0000",
        //     allowOutsideClick: false
        // });

        // if (result.isConfirmed) {
        //     try {
        //         Swal.fire({
        //             title: "Guardando...",
        //             didOpen: () => Swal.showLoading(),
        //             allowOutsideClick: false
        //         });

        //         await guardarDatos();

        //         setAccountsPayable(prev => prev.map(item =>
        //             item.checked ? { ...item, checked: false } : item
        //         ));
        //         setStep(1);

        //         Swal.fire({
        //             title: "Éxito",
        //             text: "La solicitud se ha efectuado correctamente",
        //             icon: "success",
        //             timer: 2000,
        //             showConfirmButton: false
        //         });

        //     } catch (error) {
        //         Swal.fire({
        //             title: "Error",
        //             text: error.message || "¡Ocurrió un error!",
        //             icon: "error"
        //         });
        //     }
        // }
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
    )

    // Componente para mostrar cuando no hay documentos, haciéndolo más visual.
    const NoDocumentsView = () => (
        <div className="flex flex-col items-center justify-center gap-4 text-gray-500 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">¡Todo está al día!</h3>
            <p className="text-sm max-w-xs text-center">No hay documentos pendientes de selección en este momento. ¡Buen trabajo!</p>
        </div>
    );

    const renderPayableItems = () => {
        const filteredItems = selectedWeek
            ? accountsPayable.filter(item => {
                const fecha = new Date(item.issueDate);
                const semana = `Semana ${getISOWeekOfMonth(fecha)} - ${fecha.toLocaleDateString('es-ES', { month: 'long' })} ${fecha.getFullYear()}`;
                return semana === selectedWeek;
            })
            : accountsPayable;

        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        const currentItems = filteredItems.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        const paginate = (pageNumber) => setCurrentPage(pageNumber);

        return (
            <div className="flex flex-col h-[650px] rounded-lg shadow-lg overflow-hidden bg-white">
                <div className="flex-1 overflow-auto">
                    { accountsPayable.length > 0 ? 
                        (                    
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Selección</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Número de documento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Fecha Emisión</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Fecha Vencimiento</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Días de financiamiento</th> */}
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Cliente</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Monto</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Cuenta Davivienda</th> */}
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">NIT</th> */}
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Correo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Código Proveedor</th> */}
                                    </tr>
                                </thead>
                                
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.map(item => {
                                        // 1. Calculamos la fecha de vencimiento (issueDate + 60 días)
                                        const issueDate = new Date(item.issueDate);
                                        const dueDate = new Date(issueDate);
                                        dueDate.setDate(issueDate.getDate() + 60);

                                        // 2. Calculamos la diferencia con el día de hoy
                                        const hoy = new Date();
                                        // Diferencia en milisegundos convertida a días
                                        const diasParaVencer = (dueDate - hoy) / (1000 * 60 * 60 * 24);

                                        // 3. Condición: deshabilitar si faltan 5 días o menos (o si ya venció)
                                        const isDisabled = diasParaVencer <= 5;

                                        return (
                                        <tr 
                                            key={item.id} 
                                            className={`
                                            ${item.checked ? 'bg-red-50 border-l-4 border-red-700' : ''} 
                                            ${isDisabled ? 'bg-gray-100 opacity-60 grayscale' : 'hover:bg-gray-50'}
                                            `}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap w-16">
                                            <input
                                                type="checkbox"
                                                checked={item.checked && !isDisabled}
                                                disabled={isDisabled} // Bloquea el checkbox
                                                onChange={(e) => { 
                                                e.stopPropagation(); 
                                                handleCheckboxChange(item.id); 
                                                }}
                                                // 'pointer-events-none' en el input asegura que no sea clickeable
                                                className={`h-4 w-4 rounded border-gray-300 text-red-950 focus:ring-red-950 ${isDisabled ? 'cursor-not-allowed pointer-events-none' : ''}`}
                                                style={{ accentColor: '#8B0000' }}
                                            />
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap w-40">
                                            <span className={`font-bold text-sm ${isDisabled ? 'text-gray-400' : 'text-red-950'}`}>
                                                {item.CCF}
                                            </span>
                                            </td>

                                            {/* Fecha de Emisión */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                                            {issueDate.toLocaleDateString('es-ES')}
                                            </td>

                                            {/* Fecha de Vencimiento (la que calculamos) */}
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm w-32 ${isDisabled ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                            {dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-32">
                                            $ {formatNumber(item.amount)}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                                
                            </table>
                        ) 
                        : 
                        (
                            <NoDocumentsView></NoDocumentsView>
                        )
                    }

                </div>
                <div className="flex-shrink-0 flex justify-between px-4 py-3 bg-white border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Anterior</button>
                        <button onClick={() => paginate(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Siguiente</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> de <span className="font-medium">{filteredItems.length}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <span className="sr-only">Anterior</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number ? 'z-10 bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <span className="sr-only">Siguiente</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen gap-4 rounded-lg">
            <div className="w-4/6 flex flex-col">
                <div className="flex w-full gap-2 bg-gray-200 p-2 rounded-lg">
                    <WelcomeBannerCard />
                    <CardDisbursementDate disbursementDate={disbursementDate} />
                </div>
          

                <div className="flex flex-col gap-4 justify-between mt-4">
                    {step === 1 && (
                        <div className="h-full">
                            {renderPayableItems()}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col h-full mt-4">
                            <ItemsSelectedCard accountsPayable={details} />
                            <div className="border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="cursor-pointer w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Icon path={mdiKeyboardReturn} size={1} color="gray" />
                                    Regresar
                                </button>   
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-2/6 rounded-lg flex flex-col bg-gray-200 p-2 justify-between">

                {/* <CardDisbursementDate disbursementDate={disbursementDate} /> */}
                <div className="">
                    <SupplierData
                        nit={nit} 
                        bankAccount={bankAccount} 
                        email={email} 
                        code={code}
                        entityName={entityName}>
                    </SupplierData>
                    <div className="flex flex-col justify-between">
                        <FinancingSummaryCard
                            totalAmount={formatNumber(totalAmount)}
                            porcentaje={calculatePercentage()}
                            commission={formatNumber(totalCommissions)}
                            interests={formatNumber(totalInterests)}
                            financialAmount={formatNumber(totalAmountToFinance)}
                            amountToBePaid={formatNumber(totalAmountToBeDisbursed)}
                        />
                    </div>
                </div>

                <div className="">
                        {step === 1 && (
                            <button
                                disabled={!accountsPayable.some(item => item.checked)}
                                onClick={nextStep}
                                className={`cursor-pointer mt-4 w-full py-2 px-4 rounded-md shadow-lg text-sm font-medium text-white ${accountsPayable.some(item => item.checked)
                                    ? 'bg-red-800 hover:bg-red-700'
                                    : 'bg-red-500 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                Ver detalles
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                onClick={openDisclaimer}
                                className="cursor-pointer mt-4 w-full flex justify-center items-center gap-2 py-2 px-4 bg-red-800 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700"
                            >
                                Solicitar desembolso
                                <Icon path={mdiCashFast} size={1} color="white" />
                            </button>
                        )}
                </div>
            </div>

            <DisclaimerSupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Términos y Condiciones aplicables al Servicio Bancario para la Gestión y Anticipo de Pago a Proveedores</h2>

                <div className="text-gray-700 mb-6 max-h-72 overflow-y-auto pr-4 text-sm space-y-3">
                    <p>
                        Al continuar con esta operación, usted (en adelante, "el Proveedor") reconoce, declara y acepta de manera expresa e irrevocable los siguientes Términos y Condiciones aplicables al Servicio Bancario para la Gestión de pago o Anticipo de Pago a Proveedores ( en adelante, “Servicio de Anticipo de Pago”), solicitado a través de este sistema (en adelante, "la Plataforma"), brindado por Banco Davivienda Salvadoreño, Sociedad Anónima (en adelante, el “Banco”).
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

export default SelectDocuments;