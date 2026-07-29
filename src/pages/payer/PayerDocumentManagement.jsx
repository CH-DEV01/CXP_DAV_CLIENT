import React, { useState, useMemo, useEffect } from "react";
import HeaderCard from "../../components/HeaderCard";
import { FaSearch, FaFile, FaTimes, FaFileExcel } from "react-icons/fa";
import Modal from "../../components/Modal";
import { entityService } from "../../services/admin/entityService";
import { agreementService } from "../../services/shared-services/agreementService";
import Swal from "sweetalert2";
import LogBook from "../../components/LogBook";
import { auditService } from "../../services/audit/auditService";
import { reportService } from "../../services/shared-services/reportService.js";
import { useAuth } from "../../context/AuthContext.jsx";

// ==========================================
// 1. HELPERS DE FORMATO PARA LAS COLUMNAS
// ==========================================
const formatCurrency = (value) => (
  <span className="font-medium text-slate-800">
    ${" "}
    {Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  </span>
);

const formatDate = (value) => {
  if (!value) return <span className="text-gray-400 italic">Pendiente</span>;

  let dateObj;

  // Si el valor es un número puro de 5 dígitos (como el de Excel "45915")
  if (!isNaN(value) && Number(value) > 10000 && Number(value) < 99999) {
    const excelDays = Number(value);
    // Fórmula para convertir días de Excel a milisegundos de JavaScript (Unix)
    // 25569 son los días de diferencia entre la época Excel (1900) y Unix (1970)
    dateObj = new Date((excelDays - 25569) * 86400 * 1000);
    // Ajustamos la zona horaria para que no se atrase un día
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
  } else {
    // Si viene un string normal ISO (ej: "2026-06-02T14:30:00")
    dateObj = new Date(value);
  }

  // Si a pesar de todo la fecha no se puede leer
  if (isNaN(dateObj.getTime())) return <span>Formato inválido</span>;

  return dateObj.toLocaleString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatStatus = (status) => {
  const statusStyles = {
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    DISBURSED: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const statusTranslations = {
    APPROVED: "Aprobado",
    PENDING: "Pendiente",
    PROCESSING: "En Proceso",
    REJECTED: "Rechazado",
    DISBURSED: "Desembolsado",
  };

  const appliedStyle =
    statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  const displayStatus = statusTranslations[status] || status || "N/A";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${appliedStyle}`}
    >
      {displayStatus}
    </span>
  );
};

// ==========================================
// 2. DEFINICIÓN DE COLUMNAS CON FORMATO
// ==========================================
const columns = [
  { header: "NUMERO DOCUMENTO", accessor: "documentNumber", sortable: true },
  {
    header: "MONTO",
    accessor: "amountToFinance",
    sortable: true,
    render: formatCurrency,
  }, // Asegúrate de que el accessor coincida con tu DTO (amount o amountToFinance)
  { header: "COMISION", accessor: "commission", render: formatCurrency },
  { header: "INTERESES", accessor: "interest", render: formatCurrency },
  {
    header: "FECHA DE EMISION",
    accessor: "issueDate",
    sortable: true,
    render: formatDate,
  },
  {
    header: "FECHA DE DESEMBOLSO",
    accessor: "disbursementDate",
    sortable: true,
    render: formatDate,
  },
  {
    header: "ESTADO",
    accessor: "status",
    sortable: true,
    render: formatStatus,
  },
];

const actionConfig = {
  "CREATE-APPROVED": {
    color: "text-blue-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-4 h-4 text-blue-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
    ),
  },
  Selección: {
    color: "text-green-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-4 h-4 text-green-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
        />
      </svg>
    ),
  },
  default: {
    color: "text-gray-500",
    icon: <span className="w-2 h-2 rounded-full bg-gray-500"></span>,
  },
};

const PayerDocumentManagement = () => {
  const [entities, setEntities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentDocumentLog, setCurrentDocumentLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // <-- Nuevo estado para controlar la carga inicial
  const { userData } = useAuth();

  const ITEMS_PER_PAGE = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para el ordenamiento (Nuevos, para pasarlos al LogBook)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    try {
      await reportService.downloadPayerHistoricalExcel(userData.entityId);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al generar reporte",
        text: error.message || "No se pudo descargar el archivo Excel.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await agreementService.getAgreementsByPayer(
          userData.entityId,
        );
        console.log(response);
        if (response.status === 200) {
          const todosLosDocumentos = response.data.reduce(
            (acumulador, item) => acumulador.concat(item.documents),
            [],
          );
          setDocuments(todosLosDocumentos);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [userData]);

  // -----------------------------------------
  // Lógica del modal de edición/creación
  // -----------------------------------------
  const [formData, setFormData] = useState({
    dui: "",
    name: "",
    entityName: "",
    roleName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    Swal.fire({
      title: "Procesando...",
      text: "Guardando los cambios, por favor espere.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      if (editingParam) {
        await entityService.updateParameter(editingParam.id, formData); // Asumí que es entityService
      } else {
        await entityService.createParameter(formData);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: editingParam
          ? "Actualizado correctamente."
          : "Creado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refrescar lista (Ajustar a tu lógica real)
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la información.",
      });
    }
  };

  const handleCreate = () => {
    setEditingParam(null);
    setFormData({ dui: "", name: "", entityName: "", roleName: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (param) => {
    setEditingParam(param);
    setFormData({
      dui: param.dui || "",
      name: param.name || "",
      entityName: param.entityName || "",
      roleName: param.roleName || "",
    });
    setIsModalOpen(true);
  };

  const handleShowLog = async (param) => {
    Swal.fire({
      title: "Cargando bitácora...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Ojo: Asegúrate de que tu param tenga 'id' o 'document_id' según tu backend
      const docId = param.id || param.document_id || param.documentId;
      const result = await auditService.getLogsByDocumentId(docId);

      if (result.success) {
        setCurrentDocumentLog(result.data);
        Swal.close();
        setIsLogModalOpen(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la bitácora.",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParam(null);
  };

  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
  };

  // -----------------------------------------
  // Lógica de ordenamiento y filtrado
  // -----------------------------------------

  const handleSort = (columnAccessor) => {
    if (sortColumn === columnAccessor) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnAccessor);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let data = Array.isArray(documents) ? [...documents] : [];

    // 1. Filtrado por búsqueda
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          (item.documentNumber?.toLowerCase() || "").includes(lowSearch) ||
          (item.status?.toLowerCase() || "").includes(lowSearch),
      );
    }

    // 2. Ordenamiento
    if (sortColumn) {
      data.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        // Manejar valores nulos
        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        // Ordenamiento numérico si es un número (ej. amount)
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        // Ordenamiento por defecto (texto/fechas como string)
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === "asc" ? -1 : 1;
        if (strA > strB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [searchTerm, documents, sortColumn, sortDirection]);

  const totalPages =
    Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  // -----------------------------------------

  return (
    <div className="w-full">
      <div className="flex md:flex-row items-center justify-between gap-8 w-full">
        <div className="w-1/2">
          <HeaderCard
            title={"Bitácora de documentos"}
            buttonText={"entidad"}
            onButtonClick={handleCreate}
            description={"Administre los documentos registrados en el sistema"}
            icon={<FaFile />}
          />
        </div>

        <div className="border-b border-gray-200 mb-4"></div>

        {/* --- BARRA DE ACCIONES: Búsqueda y Exportación --- */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 w-full mb-6">
          {/* Input de Búsqueda (Izquierda) */}
          <div className="relative w-full sm:w-1/2 lg:w-[40%] group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors duration-300">
              <FaSearch size={16} />
            </div>

            <input
              type="text"
              placeholder="Buscar por número o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-10 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-red-400 rounded-full outline-none shadow-sm transition-all duration-300 focus:ring-4 focus:ring-red-500/15"
            />

            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-200 focus:outline-none"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-sm ${
              isDownloadingReport
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 hover:shadow-md"
            }`}
          >
            {isDownloadingReport ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <FaFileExcel size={16} />
            )}
            {isDownloadingReport ? "Generando Excel..." : "Exportar histórico"}
          </button>
        </div>
        
      </div>

      <div className="mt-4">
        <LogBook
          columns={columns}
          data={paginatedData}
          isLoading={isLoading} // Pasamos el estado de carga real a la tabla
          onEdit={handleEdit}
          onDelete={handleShowLog} // En tu código, onDelete abre el log
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSort={handleSort} // Pasamos las funciones de ordenamiento
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </div>

      {/* MODAL DE BITÁCORA */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={handleCloseLogModal}
        title="Bitácora del documento"
        footer={
          <button
            onClick={handleCloseLogModal}
            className="py-2 px-4 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          >
            Cerrar
          </button>
        }
      >
        <div className="flex flex-col w-full">
          {currentDocumentLog && currentDocumentLog.length > 0 ? (
            currentDocumentLog.map((logItem, index) => {
              const config =
                actionConfig[logItem.actionType] || actionConfig["default"];
              return (
                <div
                  key={index}
                  className="border-b pb-5 pt-5 first:pt-0 border-gray-200 last:border-b-0 last:pb-0"
                >
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    {config.icon}
                    <span className={config.color}>
                      {logItem.actionType === "CREATE-APPROVED"
                        ? "Carga"
                        : logItem.actionType}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Usuario
                      </span>
                      <span className="block text-sm text-gray-900 font-medium">
                        {logItem.userName}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        DUI: {logItem.userDui}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Fecha y Hora
                      </span>
                      <span className="block text-sm text-gray-900 capitalize">
                        {logItem.timestamp}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Términos Aceptados
                      </span>
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">
                        Versión {logItem.termsVersion}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      User Agent
                    </span>
                    <div className="text-gray-600 text-xs break-all font-mono bg-gray-50 p-2 rounded-md border border-gray-100">
                      {logItem.userAgent}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm">
              No se encontraron registros en la bitácora para este documento.
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL DE EDICIÓN */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingParam ? "Modificar documento" : "Crear documento"}
        footer={
          <>
            <button
              onClick={handleCloseModal}
              className="py-2 px-4 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 shadow-md"
            >
              {editingParam ? "Guardar cambios" : "Guardar"}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          {/* Tus inputs del formulario se mantienen iguales... */}
          <p className="text-sm text-gray-500">
            Aquí va tu formulario de edición...
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default PayerDocumentManagement;
