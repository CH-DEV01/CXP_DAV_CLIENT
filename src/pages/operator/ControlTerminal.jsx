import React, { useState, useEffect } from "react";
import Icon from "@mdi/react";
import {
  mdiMicrosoftExcel,
  mdiLoading,
  mdiHistory,
  mdiDownload,
  mdiFileDocumentMultiple,
  mdiDomain,
  mdiShieldCheck,
  mdiCreditCardSettings,
  mdiInboxOutline,
  mdiCheckAll,
  mdiClose,
  mdiCheckboxMarkedOutline,
  mdiLightningBolt, // Ícono extra para denotar acción automática
} from "@mdi/js";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { operatorService } from "../../services/operator/operatorService";
import { auditService } from "../../services/audit/auditService";

// ==========================================
// MODAL: CONFIRMACIÓN PARCIAL DEL LOTE (Se mantiene intacto)
// ==========================================
const ConfirmBatchModal = ({
  isOpen,
  onClose,
  onConfirm,
  batchData,
  isConfirming,
}) => {
  const [selectedDocs, setSelectedDocs] = useState({});

  useEffect(() => {
    if (batchData && batchData.documents) {
      const initialSelection = {};
      batchData.documents.forEach((doc) => {
        initialSelection[doc.id] = true;
      });
      setSelectedDocs(initialSelection);
    }
  }, [batchData]);

  const handleCheckboxChange = (docId) => {
    setSelectedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleSendConfirmation = () => {
    const successfulIds = Object.keys(selectedDocs).filter(
      (docId) => selectedDocs[docId] === true,
    );
    onConfirm(successfulIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              Confirmar resultados del Lote: {batchData?.batchNumber}
            </h2>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-red-600">
                {" "}
                Desmarque únicamente{" "}
              </span>
              los documentos cuyos desembolsos no fueron procesados
              correctamente en el Core Bancario.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
          >
            <Icon path={mdiClose} size={1} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 bg-slate-50/30">
          <table className="w-full text-left text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-16 text-center">Éxito</th>
                <th className="p-4">No. Documento</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batchData?.documents?.map((doc) => (
                <tr
                  key={doc.id}
                  className={
                    !selectedDocs[doc.id] ? "bg-red-50/50" : "hover:bg-slate-50"
                  }
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                      checked={!!selectedDocs[doc.id]}
                      onChange={() => handleCheckboxChange(doc.id)}
                    />
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {doc.documentNumber}
                  </td>
                  <td className="p-4 text-slate-600">{doc.supplierName}</td>
                  <td className="p-4 text-right font-mono font-medium text-slate-800">
                    $
                    {Number(doc.amountToFinance || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendConfirmation}
            disabled={isConfirming}
            className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md flex items-center transition-all disabled:opacity-50"
          >
            {isConfirming ? (
              <>
                <Icon
                  path={mdiLoading}
                  size={0.8}
                  className="animate-spin mr-2"
                />{" "}
                Procesando...
              </>
            ) : (
              <>
                <Icon path={mdiCheckAll} size={0.9} className="mr-2" />{" "}
                Confirmar desembolsos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const BatchDownloadCenter = () => {
  const { userData } = useAuth(); // Asumo que sacas el usuario de aquí

  const [payersResume, setPayersResume] = useState([]);
  const [batchHistory, setBatchHistory] = useState([]);
  const [selectedPayerId, setSelectedPayerId] = useState("");
  const [activeTermVersionId, setActiveTermVersionId] = useState();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBatchToConfirm, setSelectedBatchToConfirm] = useState(null);

  const loadData = async () => {
    try {
      const resPayers = await operatorService.getPayersResume();
      const pagadores = resPayers.data?.data || resPayers.data;
      setPayersResume(pagadores || []);

      if (pagadores && pagadores.length > 0 && !selectedPayerId) {
        setSelectedPayerId(pagadores[0].id);
      }

      const resHistory = await operatorService.getBatchHistory();
      setBatchHistory(resHistory.data?.data || resHistory.data || []);

      const resTermVersion = await auditService.getByActiveStatusPayer();
      setActiveTermVersionId(resTermVersion || "");
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentPayer = payersResume.find((p) => p.id === selectedPayerId) || {
    name: "Cargando...",
    paymentPolicy: "-",
    creditLineNumber: "-",
    availableDocuments: 0,
  };

  // --- ACCIÓN: GENERAR BATCH AUTOMÁTICO DIRECTO (Cerebro Financiero) ---
  const handleGenerateAutomaticBatch = async () => {
    setIsGenerating(true);
    try {
      // 🚀 NUEVO PAYLOAD: Solo enviamos el ID del pagador, el backend se encarga del resto
      const payload = {
        payerId: selectedPayerId,
        termVersionId: activeTermVersionId.data.id,
      };

      // Si necesitas confirmación visual del operario antes de lanzar la magia
      const confirm = await Swal.fire({
        title: "¿Generar batch de documentos?",
        text: `El sistema agrupará todos los documentos listos del pagador: ${currentPayer.name}.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "Sí, generar Excel",
      });

      if (!confirm.isConfirmed) {
        setIsGenerating(false);
        return;
      }

      // 1. Llamar al servicio que agrupa en la base de datos y retorna el Excel
      const response = await operatorService.generateBatchExcel(
        payload,
        userData.id,
      );

      // 2. Descargar el Blob
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = currentPayer.name.replace(/[^a-zA-Z0-9]/g, "_");
      link.setAttribute(
        "download",
        `Lote_${safeName}_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire(
        "¡Éxito!",
        "El archivo Excel se ha descargado y el lote ha sido registrado en la base de datos.",
        "success",
      );
      loadData(); // Refrescar tablas
    } catch (error) {
      console.error("Error generando lote automático:", error);
      Swal.fire(
        "Error",
        "No se pudo generar el archivo batch. Verifica si hay facturas listas.",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // --- ACCIÓN: ABRIR MODAL DE CONFIRMACIÓN ---
  const handleOpenConfirmModal = async (lote) => {
    try {
      const response = await operatorService.getBatchDetails(lote.id);
      setSelectedBatchToConfirm(response.data?.data || response.data);
      setConfirmModalOpen(true);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar el detalle del lote.", "error");
    }
  };

  // --- ACCIÓN: EJECUTAR CONFIRMACIÓN BANCARIA ---
  const handleExecuteConfirmation = async (successfulIds) => {
    setIsConfirming(true);
    try {
      const payload = {
        successfulDocumentIds: successfulIds,
        termVersionId: activeTermVersionId.data.id,
      };

      await operatorService.confirmBatchPartial(
        selectedBatchToConfirm.id,
        payload,
        userData.id,
      );

      setConfirmModalOpen(false);
      Swal.fire(
        "¡Confirmado!",
        "Los documentos se desembolsaron correctamente.",
        "success",
      );
      loadData();
    } catch (error) {
      Swal.fire("Error", "No se pudo procesar la confirmación.", "error");
    } finally {
      setIsConfirming(false);
    }
  };

  // --- ACCIÓN: RE-DESCARGAR EXCEL ---
  const handleReDownload = async (lote) => {
    try {
      Swal.fire({
        title: "Descargando...",
        text: "Obteniendo el archivo desde el servidor",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await operatorService.redownloadBatchExcel(lote.id);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${lote.batchNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.close();
    } catch (error) {
      Swal.fire("Error", "No se pudo descargar el archivo del lote.", "error");
    }
  };

  return (
    <div className="w-full font-sans text-slate-800">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ================= COLUMNA IZQUIERDA ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex-shrink-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Icon path={mdiDomain} size={0.7} className="text-red-500" />{" "}
              Seleccionar pagador
            </label>
            <select
              value={selectedPayerId}
              onChange={(e) => setSelectedPayerId(e.target.value)}
              disabled={payersResume.length === 0}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 text-slate-700 font-medium focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all cursor-pointer disabled:opacity-50"
            >
              {payersResume.length === 0 ? (
                <option value="">Cargando pagadores...</option>
              ) : (
                payersResume.map((payer) => (
                  <option key={payer.id} value={payer.id}>
                    {payer.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-700 flex-shrink-0"></div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 leading-tight mb-4">
                {currentPayer.name}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 p-2 rounded-lg mt-0.5">
                    <Icon
                      path={mdiShieldCheck}
                      size={0.8}
                      className="text-red-600"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Política de Pago
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentPayer.paymentPolicy || "T + 1 Hábil"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 p-2 rounded-lg mt-0.5">
                    <Icon
                      path={mdiCreditCardSettings}
                      size={0.8}
                      className="text-red-600"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Línea de crédito
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentPayer.creditLineNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                      Docs. Listos
                    </p>
                    <p className="text-xs text-slate-400">
                      Acumulados para pagar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-red-600">
                      {currentPayer.availableDocuments}
                    </span>
                    <Icon
                      path={mdiFileDocumentMultiple}
                      size={1}
                      className="text-red-200"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateAutomaticBatch}
                disabled={isGenerating || currentPayer.availableDocuments === 0}
                className={`mt-auto w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all
                  ${
                    isGenerating || currentPayer.availableDocuments === 0
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-md shadow-red-600/20"
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Icon
                      path={mdiLoading}
                      size={0.9}
                      className="animate-spin mr-2"
                    />{" "}
                    Agrupando y Generando Excel...
                  </>
                ) : (
                  <>
                    <Icon path={mdiLightningBolt} size={0.9} className="mr-2" />{" "}
                    Generar batch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUMNA DERECHA: HISTÓRICO (Se mantiene intacto) ================= */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 flex-shrink-0">
              <Icon path={mdiHistory} size={0.9} className="text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Histórico de batch generados
              </h2>
            </div>
            <div className="overflow-x-auto flex-1 flex flex-col">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                {/* ... (Tu tabla de histórico se mantiene exactamente igual) ... */}
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ID Lote
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Fecha Generación
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Registros
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Monto Total
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {batchHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        {/* Contenido vacío... */}
                      </td>
                    </tr>
                  ) : (
                    batchHistory.map((lote) => (
                      <tr
                        key={lote.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-700">
                            {lote.batchNumber}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-500">
                            {new Date(lote.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            {lote.documentCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-slate-800">
                            ${Number(lote.totalAmount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center flex justify-center gap-2">
                          <button
                            onClick={() => handleReDownload(lote)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
                            title="Re-descargar Excel"
                          >
                            <Icon path={mdiDownload} size={0.8} />
                          </button>
                          {lote.status === "PENDING" && (
                            <button
                              onClick={() => handleOpenConfirmModal(lote)}
                              className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg"
                              title="Confirmar pago"
                            >
                              <Icon path={mdiCheckAll} size={0.8} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación Parcial (El único que queda vivo) */}
      <ConfirmBatchModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteConfirmation}
        batchData={selectedBatchToConfirm}
        isConfirming={isConfirming}
      />
    </div>
  );
};

export default BatchDownloadCenter;
