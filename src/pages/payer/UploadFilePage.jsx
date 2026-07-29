import React, { useState, useEffect } from "react";
import {
  uploadFile,
  downloadOfficialTemplate,
  downloadUserManual,
} from "../../services/admin/uploadFileService.js";
import { payerService } from "../../services/admin/payerService.js";
import { creditFacilityService } from "../../services/credit-facility/CreditFacilityService.js";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ProgressBarCard from "../../components/ProgressBarCard.jsx";
import DisclaimerSupplierModal from "../../components/modals/DisclaimerSupplierModal.jsx";
import {
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { FiFileText } from "react-icons/fi";
import LimitExceeded from "../../components/LimitExceeded.jsx";
import PayerData from "../../components/PayerData.jsx";
import { auditService } from "../../services/audit/auditService.js";
import { creditLineService } from "../../services/admin/creditLineService.js";

const UploadFilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creditLineLevel, setCreditLineLevel] = useState(95);
  const [isAccepted, setIsAccepted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedPayerId, setSelectedPayerId] = useState(null);
  const [payers, setPayers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { userData } = useAuth();
  const [selectedPayer, setSelectedPayer] = useState({});
  const [termVersion, setTermVersion] = useState("");
  const [creditMetrics, setCreditMetrics] = useState(null);
  const [availableLimitAmount, setAvailableLimitAmount] = useState(0);

  // Estados para las descargas de recursos
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingManual, setIsDownloadingManual] = useState(false);

  useEffect(() => {
    const fetchPayers = async () => {
      try {
        const response = await payerService.getEntities();
        if (response.status === 200) {
          setPayers(response.data);
          handleSelectPayer(response.data[0]);
          setSelectedPayer(response.data[0]);
        } else {
          console.error("Error fetching payers:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching payers:", error);
      }
    };
    fetchPayers();
  }, []);

  useEffect(() => {
    const loadTermVersion = async () => {
      try {
        const response = await auditService.getByActiveStatusPayer();
        setTermVersion(response.data.id);
      } catch (error) {
        console.error(error);
      }
    };
    loadTermVersion();
  }, []);

  const saveAcceptanceAudit = async () => {
    const auditObject = {
      ip: "",
      userAgent: navigator.userAgent,
      userId: userData?.id,
      versionTermId: termVersion,
    };

    await auditService.saveAuditAcceptance(auditObject);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const allowedExcelTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (allowedExcelTypes.includes(file.type) || file.name.endsWith(".xlsx")) {
      setSelectedFile(file);
      setUploadStatus("");
    } else {
      Swal.fire({
        icon: "error",
        title: "Formato de archivo no válido",
        text: "Por favor, selecciona un archivo de Excel con formato .xlsx o .xls.",
        confirmButtonText: "Entendido",
      });
      setSelectedFile(null);
      event.target.value = null;
    }
    setUploadStatus("");
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadStatus("Subiendo archivo...");

    if (!selectedFile) {
      setUploadStatus("Por favor selecciona un archivo primero");
      setIsUploading(false);
      return;
    }

    try {
      await uploadFile(selectedFile, userData.entityId, userData.id, termVersion);

      Swal.fire({
        title: "¡Lote Cargado Exitosamente!",
        text: "El archivo se ha procesado correctamente, el reporte ha sido descargado y las facturas están disponibles para sus proveedores.",
        icon: "success",
        confirmButtonColor: "#059669",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error al subir archivo:", error);

      let errorMessage =
        "Error de conexión al subir el archivo. Intenta nuevamente.";

      if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Carga Rechazada",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });

      setUploadStatus("Carga fallida por límite de cupo o incidencias.");
      setIsAccepted(false);
      setIsModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPayer = async (payer) => {
    setSelectedPayerId(payer.id === selectedPayerId ? null : payer.id);
    setSelectedPayer(payer);

    try {
      const payload = {
        identifier: payer.creditLineNumber,
        identifierType: "NIU",
      };

      const responseLC = await creditLineService.getPayerCreditLineDetails(
        payer.id,
      );
      const metrics = responseLC.data.data.metrics;

      if (metrics) {
        setCreditMetrics(metrics);
        setAvailableLimitAmount(metrics.availableLimit || 0);
      }
    } catch (error) {
      console.error("Error al consultar el límite de crédito:", error);

      setCreditLineLevel(100);

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo obtener el límite de crédito del cliente. Intenta nuevamente.",
        confirmButtonText: "Entendido",
      });
    }
  };

  const handleAccept = () => {
    setIsModalOpen(false);
    //saveAcceptanceAudit();
  };

  const openDisclaimer = () => {
    setIsModalOpen(true);
  };

  // ---- MANEJADORES DE DESCARGA DE RECURSOS ----
  const onDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await downloadOfficialTemplate();
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo descargar la plantilla oficial en este momento.",
        "error",
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const onDownloadManual = async () => {
    setIsDownloadingManual(true);
    try {
      await downloadUserManual();
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo descargar el manual de usuario en este momento.",
        "error",
      );
    } finally {
      setIsDownloadingManual(false);
    }
  };

  const isLineFull = creditMetrics
    ? creditMetrics.utilizationRate >= 95
    : false;

  return (
    <div className="flex flex-col min-h-screen gap-4">
      {/* 1. BANNER SUPERIOR: Límite de Crédito */}
      {isLineFull && (
        <div className="w-full">
          <LimitExceeded></LimitExceeded>
        </div>
      )}

      {/* 2. CONTENIDO PRINCIPAL: Sidebar y Centro de Carga */}
      <div className="flex flex-col md:flex-row flex-1 gap-4">
        {/* --- PANEL IZQUIERDO (Rojo) --- */}
        <div className="shadow-2xl w-full md:w-1/3 lg:w-1/4 bg-gradient-to-r from-red-600 to-red-800 bg-red-800 text-white p-4 rounded-xl overflow-y-auto font-montserrat">
          <PayerData
            entityName={selectedPayer?.name}
            paymentPolicy={selectedPayer?.paymentPolicy}
          ></PayerData>

          {creditMetrics ? (
            <div className="bg-red-900/40 p-4 rounded-xl mt-4 border border-red-500/30 backdrop-blur-sm shadow-inner">
              <h4 className="text-[10px] uppercase font-bold text-red-200 mb-3 tracking-wider flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                Estado de la Línea
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-red-700/50 pb-2">
                  <span className="text-xs text-red-100 font-medium">
                    Cupo Total
                  </span>
                  <span className="text-sm font-mono font-bold">
                    $
                    {Number(creditMetrics.totalLimit).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-red-700/50 pb-2">
                  <span className="text-xs text-red-100 font-medium">
                    Consumo actual
                  </span>
                  <span className="text-sm font-mono font-bold">
                    $
                    {Number(creditMetrics.currentConsumed).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-red-950/50 -mx-2 px-2 py-2 rounded-lg">
                  <span className="text-xs text-white font-bold">
                    Neto Disponible
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    $
                    {Number(creditMetrics.availableLimit).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-red-700/50">
                <div className="flex justify-between text-[10px] font-bold text-red-200 mb-1.5 uppercase tracking-wider">
                  <span>Ocupación</span>
                  <span>{creditMetrics.utilizationRate}%</span>
                </div>
                <div className="w-full bg-red-950/80 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${creditMetrics.utilizationRate > 85 ? "bg-red-400" : "bg-emerald-400"}`}
                    style={{
                      width: `${Math.min(creditMetrics.utilizationRate, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </div>

        {/* --- PANEL DERECHO (Centro de carga y Recursos) --- */}
        <div className="flex-1 font-montserrat flex flex-col min-h-[70vh] md:min-h-0">
          <div className="bg-white rounded-2xl shadow-lg flex-1 flex flex-col justify-between border-2 border-gray-200">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 mt-4 md:mt-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Centro de carga de datos
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2 pb-4">
                  Gestión de archivos para el financiamiento de cuentas por
                  pagar
                </p>
              </div>

              <div className="flex justify-center mt-8 pb-8">
                <div className="w-full max-w-4xl h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-70"></div>
              </div>

              {/* GRID DE 2 COLUMNAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* --- COLUMNA 1: ZONA DE CARGA --- */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center">
                    <HiOutlineDocumentText className="w-5 h-5 mr-2 text-red-600" />
                    Carga de archivo
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-red-300 transition duration-200 bg-gray-50/50 flex-1 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mt-2 text-xs text-gray-500">
                        Formatos soportados: .xlsx, .csv
                      </p>
                    </div>

                    <div className="flex justify-center w-full">
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx,.csv"
                        className="sr-only"
                        disabled={isUploading || isLineFull >= 90}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`w-full text-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                          isUploading || isLineFull >= 90
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        Seleccionar archivo
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md flex justify-between items-center">
                        <span className="font-medium text-red-900 truncate max-w-[70%] text-sm">
                          {selectedFile.name}
                        </span>
                        <span className="text-red-700 text-xs font-bold">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      className={`w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors border flex items-center justify-center ${
                        isLineFull >= 90 || selectedFile == null
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                      }`}
                      onClick={openDisclaimer}
                      disabled={isLineFull >= 90 || selectedFile == null}
                    >
                      <HiOutlineDocumentText className="h-4 w-4 mr-2 shrink-0" />
                      Ver términos y condiciones
                    </button>

                    <button
                      onClick={handleUpload}
                      disabled={isUploading || !isAccepted}
                      className={`w-full py-3 rounded-md shadow-md text-sm font-bold text-white transition-all flex justify-center items-center ${
                        !isAccepted || isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 shadow-red-600/30"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        "Procesar archivo"
                      )}
                    </button>

                    {uploadStatus && (
                      <div
                        className={`mt-2 p-3 rounded-md text-sm text-center font-medium ${
                          uploadStatus.includes("fallida")
                            ? "bg-red-100 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {uploadStatus}
                      </div>
                    )}
                  </div>
                </div>

                {/* --- COLUMNA 2: RECURSOS DE AYUDA --- */}
                <div className="flex flex-col border-t pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8 lg:border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center">
                    <HiOutlineInformationCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Recursos y Plantillas
                  </h3>

                  <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex-1">
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Para garantizar el éxito de su carga, asegúrese de
                      utilizar nuestra plantilla oficial. Consulte el manual de
                      usuario para revisar las políticas de formato.
                    </p>

                    <div className="space-y-4">
                      {/* Botón Descargar Plantilla */}
                      <button
                        onClick={onDownloadTemplate}
                        disabled={isDownloadingTemplate}
                        className={`w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg transition-all group ${
                          isDownloadingTemplate
                            ? "bg-gray-50 opacity-70 cursor-not-allowed"
                            : "bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600 group-hover:bg-green-200">
                            <FiFileText size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">
                              Plantilla de excel oficial
                            </p>
                            <p className="text-xs text-gray-500">
                              Formato .xlsx (Vacío)
                            </p>
                          </div>
                        </div>
                        {isDownloadingTemplate ? (
                          <svg
                            className="animate-spin h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <HiOutlineDownload
                            className="text-gray-400 group-hover:text-blue-600"
                            size={20}
                          />
                        )}
                      </button>

                      {/* Botón Descargar Manual */}
                      <button
                        onClick={onDownloadManual}
                        disabled={isDownloadingManual}
                        className={`w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg transition-all group ${
                          isDownloadingManual
                            ? "bg-gray-50 opacity-70 cursor-not-allowed"
                            : "bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600 group-hover:bg-red-200">
                            <HiOutlineDocumentText size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">
                              Manual de usuario
                            </p>
                            <p className="text-xs text-gray-500">
                              Guía paso a paso (PDF)
                            </p>
                          </div>
                        </div>
                        {isDownloadingManual ? (
                          <svg
                            className="animate-spin h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <HiOutlineDownload
                            className="text-gray-400 group-hover:text-blue-600"
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 md:px-8 py-4 border-t border-gray-200 mt-8 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center md:text-left">
                Última actualización: {new Date().toLocaleDateString()} |
                Versión 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE TÉRMINOS Y CONDICIONES */}
      <DisclaimerSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Términos y Condiciones aplicables al Servicio Bancario para la Gestión
          y Anticipo de Pago a Proveedores
        </h2>

        <div className="text-gray-700 mb-6 max-h-72 overflow-y-auto pr-4 text-sm space-y-3">
          <p>
            Al continuar con esta operación, usted (en adelante, "el Proveedor")
            reconoce, declara y acepta de manera expresa e irrevocable los
            siguiente Términos y Condiciones aplicables al Servicio Bancario
            para la Gestión de pago o Anticipo de Pago a Proveedores (en
            adelante, “Servicio de Anticipo de Pago”), solicitado a través de
            este sistema (en adelante, "la Plataforma"), brindado por Banco
            Davivienda Salvadoreño, Sociedad Anónima (en adelante, el “Banco”).
          </p>
          <p>
            Para efectos de estos términos, se entenderá por “Cliente Pagador”
            la persona natural o jurídica a cuyo cargo fue emitida la cuenta por
            cobrar (factura, comprobante de crédito fiscal (CCF), DTE y/o
            cualquier otro documento tributario ), en adelante “Cuentas por
            Cobrar” respecto de las cuales el Proveedor puede optar
            voluntariamente por solicitar el anticipo de pago:
          </p>

          <p>
            <strong>1. Visualización y solicitud voluntaria.</strong> El
            Proveedor reconoce que, al acceder a la Plataforma, podrá visualizar
            las Cuentas por Cobrar registradas a su favor por el Cliente
            Pagador, y que tendrá la opción de solicitar, de manera voluntaria,
            el Servicio de Anticipo de Pago sobre dichas Cuentas por Cobrar.
          </p>

          <p>
            <strong>2. Naturaleza del pago anticipado.</strong> En caso de optar
            por la solicitud del Servicio de Anticipo de Pago de alguna de las
            Cuentas por Cobrar registradas por el Cliente Pagador a su favor, el
            Proveedor reconoce y acepta que, el pago anticipado que ejecuta el
            banco se realiza por cuenta, orden y a cargo del Cliente Pagador,
            entendiéndose por tal la persona natural o jurídica a cuyo cargo fue
            emitida la Cuenta por Cobrar respecto de la cual se solicita el
            anticipo, todo ello en ejecución del mandato de anticipo de pago
            otorgado por dicho Cliente Pagador al Banco.
          </p>

          <p>
            <strong>
              3. Validez y exigibilidad de las Cuentas por Cobrar.
            </strong>{" "}
            El Proveedor declara que las Cuentas por Cobrar respecto de las
            cuales solicite el Servicio de Anticipo de Pago:
            <br />
            a. corresponden a obligaciones válidas, exigibles y no
            controvertidas frente al Cliente Pagador;
            <br />
            b. no se encuentran sujetas a reclamaciones, disputas,
            compensaciones, devoluciones, anulaciones ni cualquier otra
            circunstancia que pueda afectar su existencia, exigibilidad o monto;
            y<br />
            c. no han sido total ni parcialmente saldadas con anterioridad.
          </p>

          <p>
            <strong>
              4. Titularidad y libre disposición de las Cuentas por Cobrar.
            </strong>{" "}
            El Proveedor declara además que las Cuentas por Cobrar respecto de
            las cuales solicite el Servicio de Anticipo de Pago:
            <br />
            a. son de titularidad legítima y exclusiva del Proveedor; y<br />
            b. se encuentran libres de gravámenes, retenciones, cesiones o
            transferencias previas a terceros, y no se encuentran sujetas a
            limitaciones de disposición de ninguna naturaleza.
          </p>

          <p>
            <strong>
              5. No sometimiento a disputas posteriormente a la solicitud del
              Servicio de Anticipo de Pago.
            </strong>{" "}
            Una vez solicitado el Servicio de Anticipo de Pago de una Cuenta por
            Cobrar a favor del Proveedor y ejecutado el pago anticipado por el
            Banco, el Proveedor se compromete a no someter dichas Cuentas por
            Cobrar a compensación, reclamo, disputa comercial o judicial.
          </p>

          <p>
            <strong>6. Conservación de la relación comercial.</strong> El
            Proveedor acepta que el pago anticipado ejecutado por el Banco en
            virtud del Servicio de Anticipo de Pago, no constituye cesión de
            créditos y que el Banco no adquiere la titularidad de las Cuentas
            por Cobrar ni se convierte en su cesionario, manteniéndose íntegra
            la relación jurídica existente entre el Proveedor y el Cliente
            Pagador. El Proveedor reconoce que la operación únicamente genera a
            favor del Banco un derecho de reembolso frente al Cliente Pagador
            por los montos desembolsados en su nombre.
          </p>

          <p>
            <strong>7. Comisión e Intereses por el servicio.</strong> El
            Proveedor reconoce y acepta de las Cuentas por Cobrar de las cuales
            solicite el Servicio de Anticipo de Pago, el Banco ejecutará el pago
            anticipado por la totalidad del importe de cada Cuenta por Cobrar;
            no obstante, reconoce y acepta pagar al Banco una comisión como
            remuneración por la gestión y ejecución del Servicio de Anticipo de
            Pago, la cual se devengará y será exigible al momento en que el
            Banco efectúe el desembolso del anticipo, y será cobrada por el
            Banco de forma separada, conforme a los mecanismos operativos que
            éste determine, los cuales el proveedor verá reflejado en la
            plataforma previo al envío de solicitud de pago.
            <br />
            <br />
            El interés que generará el anticipo de las cuentas por pagar será
            del ______ PUNTO _____POR CIENTO ______% y podrá ajustarse de manera
            quincenal a opción el Banco los días: uno y quince de cada uno de
            los meses comprendidos dentro del plazo y también de conformidad a
            la tasa de referencia que el banco mensualmente publica. La tasa de
            referencia correspondiente a este mes es del _____ PUNTO ______ por
            ciento, la que en sus publicaciones podrá ajustarse a opción del
            Banco; y el diferencial máximo que el banco podrá aplicar a este
            crédito durante toda su vigencia y mientras existan saldos
            pendientes será de ______ puntos porcentuales arriba de la tasa de
            referencia vigente a la fecha de cada modificación.
          </p>

          <p>
            <strong>8. Consentimiento.</strong> El Proveedor reconoce que la
            aceptación de estos Términos y Condiciones aplicables al Servicio
            Bancario para la Gestión y Anticipo de Pago a Proveedores y las
            solicitudes del Servicio de Anticipo de Pago de alguna de las
            Cuentas por Cobrar registradas a su favor que realice a través de la
            Plataforma, constituyen una manifestación expresa de su
            consentimiento.
          </p>

          <p>
            <strong>9. Limitación de responsabilidad del Banco.</strong> El
            Proveedor acepta que en le ejecución del Servicio de Anticipo de
            Pago, el Banco actúa exclusivamente como mandatario del Cliente
            Pagador y que el Banco no asume responsabilidad alguna por la
            relación comercial entre el Proveedor y el Cliente Pagador, ni por
            reclamos, disputas o incumplimientos que pudieren surgir entre
            ellos.
          </p>

          <p>
            <strong>10. Legislación Aplicable y Jurisdicción.</strong> Para
            todos los efectos legales, que se puedan originar del Servicio de
            Anticipo de Pago, el Proveedor manifiesta que se regirán por las
            leyes de la República de El Salvador. Para cualquier controversia,
            las partes se someten a la jurisdicción de los tribunales
            competentes del distrito de San Salvador, municipio de San Salvador
            Centro, departamento de San Salvador.
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
          <label
            htmlFor="accept-checkbox"
            className="ml-3 text-sm font-medium text-gray-900"
          >
            Declaro que he leído, comprendido y acepto irrevocablemente estos
            Términos y Condiciones aplicables al Servicio Bancario para la
            Gestión y Anticipo de Pago a Proveedores.
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4 flex-col sm:flex-row">
          <button
            onClick={() => setIsModalOpen(false)}
            className="cursor-pointer w-full sm:w-auto px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold mb-2 sm:mb-0"
          >
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!isAccepted}
            className="cursor-pointer w-full sm:w-auto px-5 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-red-700"
          >
            Confirmar solicitud
          </button>
        </div>
      </DisclaimerSupplierModal>
    </div>
  );
};

export default UploadFilePage;
