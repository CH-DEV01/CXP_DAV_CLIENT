import React, { useState, useEffect, useCallback, use } from 'react';
import Icon from '@mdi/react';
import Swal from 'sweetalert2';
import { mdiContentSaveAll, mdiKeyboardReturn, mdiFilter } from '@mdi/js';
import getISOWeekOfMonth from '../../utils/getISOWeekOfMonth.js';
import FinancingDaysCard from '../../components/Home/FinancingDaysCard.jsx';
import FinancingSummaryCard from '../../components/Home/FinancingSummaryCard.jsx';
import formatNumber from '../../utils/formatNumber.js';
import WelcomeBannerCard from '../../components/Home/WelcomeBannerCard.jsx';
import ClockCard from '../../components/Home/ClockCard.jsx';
import CardDisbursementDate from '../../components/Home/CardDisbursementDate.jsx';
import ItemsSelectedCard from '../../components/Home/ItemsSelectedCard.jsx';
import getAvailableWeeks from '../../utils/getAvailableweeks.js';
import { agreementService } from '../../services/shared-services/agreementService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAgreement } from '../../context/AgreementContext.jsx';
import { operationsService } from '../../services/operations/operationsService.js';
import { entityService } from '../../services/admin/entityService.js';

import {
    FINANCING,
    AUTH_MODES,
    DOCUMENT_STATUS
} from '../../constants/parameters.js';

const SelectDocumentsTwoModeAuth = () => {

    const [totalAmount, setTotalAmount] = useState(0);
    const [totalCommissions, setTotalCommissions] = useState(0);
    const [totalAmountToBeDisbursed, setTotalAmountToBeDisbursed] = useState(0);
    const [totalAmountToFinance, setTotalAmountToFinance] = useState(0);
    const [totalInterests, setTotalInterests] = useState(0);
    const [cutOffDate, setCutOffDate] = useState(null);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [step, setStep] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [disbursementDate, setDisbursementDate] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [accountsPayable, setAccountsPayable] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [details, setDetails] = useState([]);

    const [supplierEntity, setSupplierEntity] = useState(null);

    const { agreement, saveAgreement } = useAgreement();

    const serialToDateObject = (serial) => {

        const utcDays = Math.floor(serial);
        const date = new Date(Date.UTC(1900, 0, 1));
        date.setUTCDate(date.getUTCDate() + utcDays);

        if (serial > 59) {
            date.setUTCDate(date.getUTCDate() - 1);
        }

        return date;
    };

    // useEffect(() => {

    //     const selectedData = [
    //         ...accountsPayable.filter(item => item.checked)

    //     ]

    // }, [accountsPayable]);

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

    useEffect(() => {
        const loadAgreement = () => {
            try {

                const uploadedDocuments = agreement.documents.filter(doc => doc.status === DOCUMENT_STATUS.SELECTED);

                const mappedAccounts = uploadedDocuments.map(ccf => ({
                    id: ccf.document_id || ccf.documentNumber || ccf.numeroQuedan || ccf.numeroDTE,
                    title: ccf.proveedor || "Proveedor no especificado",
                    concept: ccf.concepto || "Concepto no especificado",
                    amount: ccf.amount || 0,
                    checked: true,
                    CCF: ccf.documentNumber || '',
                    issueDate: serialToDateObject(ccf.issueDate),
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
                    // Mantener toda la información original del documento
                    originalDocument: ccf
                }));

                setAccountsPayable(mappedAccounts);
                calculateNextFriday(); // Calcular fecha de desembolso inicial

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
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    // const calculateNextFriday = useCallback(() => {
    //     const today = new Date();
    //     const nextFriday = new Date(today);
    //     nextFriday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);
    //     setDisbursementDate(nextFriday);
    //     return nextFriday;
    // }, []);

    const calculateNextFriday = useCallback(() => {
        // ── 1. Día siguiente
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);   // T + 1

        // ── 2. Omitir fin de semana (opcional)
        if (nextDay.getDay() === 6) {             // Sábado → +2 ⇒ lunes
            nextDay.setDate(nextDay.getDate() + 2);
        } else if (nextDay.getDay() === 0) {      // Domingo → +1 ⇒ lunes
            nextDay.setDate(nextDay.getDate() + 1);
        }

        setDisbursementDate(nextDay);             // actualiza estado
        return nextDay;                           // devuelve la fecha
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
                // Vamos a sumar un dia a la fecha de ahora
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                const diffDays = daysBetween(tomorrow, cutOffDate);
                //const timeDiff = cutOffDate - nextFriday;
                //const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                return { diffDays, amount: item.amount, documentNumber: item.CCF, cutOffDate: cutOffDate };
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
            // Cuando no hay selección, reiniciamos TODO
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

    // Calcular porcentaje
    const calculatePercentage = () => {
        if (totalAmount <= 0) return '0.00';

        const result = ((totalAmount - (totalAmount * 0.0055) - totalInterests) / totalAmount) * 100;
        return formatNumber(result) || '0.00';
    };

    // Guardar datos en el servidor
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
                status: "APPROVED",
                payerId: agreement.payer,
                authMode: AUTH_MODES.TWO_FACTOR_MODE
            };

            const response = await agreementService.updateDocumentsSelected(payload);

            // const updatedAgreement = agreementService.getAgreementById(agreement.agreement_id);
            // saveAgreement(updatedAgreement);

            const { data } = await agreementService.getAgreementById(agreement.agreement_id);
+           saveAgreement(data); 

            //window.location.reload();

            return response;
        } catch (error) {
            console.error('Error al guardar los datos:', error);
            throw error;
        }
    };

    // Confirmar y guardar cambios
    const save = async () => {
        const result = await Swal.fire({
            title: "Guardar cambios",
            text: "¿Estás seguro de que desea guardar los cambios?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#8B0000",
            cancelButtonColor: "#6b7280",
            iconColor: "#8B0000",
            allowOutsideClick: false
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: "Guardando...",
                    didOpen: () => Swal.showLoading(),
                    allowOutsideClick: false
                });

                await guardarDatos();

                // Actualizar estado y mostrar éxito
                setAccountsPayable(prev => prev.map(item =>
                    item.checked ? { ...item, checked: false } : item
                ));
                setStep(1);

                Swal.fire({
                    title: "¡Guardado!",
                    text: "Los cambios se han guardado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });

            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: error.message || "Ocurrió un error al guardar",
                    icon: "error"
                });
            }
        }
    };

    // Renderizar tabla de items
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
            <div className="flex flex-col mb-4 mt-6 h-[600px] overflow-y-auto rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selección</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCF/#QUEDAN/DTE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Emisión</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta Davivienda</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Proveedor</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {currentItems.map(item => (
                                <tr key={item.id} className={`hover:bg-gray-50 ${item.checked ? 'bg-red-50 border-l-4 border-red-700' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleCheckboxChange(item.id);
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-red-950 focus:ring-red-950"
                                            style={{ accentColor: '#8B0000' }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-bold text-red-950">{item.CCF}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.issueDate.toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-800">{supplierEntity?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        $ {formatNumber(item.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {supplierEntity?.accountBank || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {supplierEntity?.nit || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {supplierEntity?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {supplierEntity?.code || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Siguiente
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> de{' '}
                                <span className="font-medium">{filteredItems.length}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
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
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
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
        <div className="flex h-screen bg-white pt-20 pl-4 pr-4">
            {/* Panel izquierdo */}
            <div className="w-4/6 bg-gray-100 m-4 ml-2 rounded-2xl p-6 flex flex-col">
                <WelcomeBannerCard />

                <div className="flex flex-col gap-4 justify-between h-full">
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

            <div className="w-2/6 bg-gray-100 m-4 mr-2 rounded-2xl p-6 flex flex-col">
                <div>
                    <FinancingDaysCard />
                    <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedWeek || ''}
                                    onChange={(e) => {
                                        setSelectedWeek(e.target.value || null);
                                        setCurrentPage(1);
                                    }}
                                    className="block w-full pl-10 pr-3 py-2.5 text-base border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none sm:text-sm cursor-pointer"
                                >
                                    <option value="">Todas las semanas</option>
                                    {getAvailableWeeks(accountsPayable).map(([clave]) => (
                                        <option key={clave} value={clave}>{clave}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <CardDisbursementDate disbursementDate={disbursementDate} />
                    </div>
                    <FinancingSummaryCard
                        totalAmount={formatNumber(totalAmount)}
                        porcentaje={calculatePercentage()}
                        commission={formatNumber(totalCommissions)}
                        interests={formatNumber(totalInterests)}
                        financialAmount={formatNumber(totalAmountToFinance)}
                        amountToBePaid={formatNumber(totalAmountToBeDisbursed)}
                    />
                </div>

                {step === 1 && (
                    <button
                        disabled={!accountsPayable.some(item => item.checked)}
                        onClick={nextStep}
                        className={`cursor-pointer mt-4 w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${accountsPayable.some(item => item.checked)
                            ? 'bg-red-800 hover:bg-red-700'
                            : 'bg-red-500 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        Ver detalles
                    </button>
                )}

                {step === 2 && (
                    <button
                        onClick={save}
                        className="cursor-pointer mt-4 w-full flex justify-center items-center gap-2 py-2 px-4 bg-red-800 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700"
                    >
                        Guardar cambios
                        <Icon path={mdiContentSaveAll} size={1} color="white" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SelectDocumentsTwoModeAuth;