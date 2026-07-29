import React, { useState, useEffect, useCallback } from "react";
import Icon from "@mdi/react";
import {
  mdiCreditCardSettings,
  mdiHistory,
  mdiCheckCircleOutline,
  mdiLoading,
  mdiClose,
  mdiCashRegister,
  mdiDomain,
  mdiFormatListChecks,
  mdiCurrencyUsd,
} from "@mdi/js";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';


// 🚀 SERVICIO DE API
import { creditLineService } from "../../services/admin/creditLineService"; // Ajusta la ruta a tu proyecto

// =======================================================================
// MODAL PARA REGISTRAR ABONO (Con Formato de Moneda Inteligente)
// =======================================================================
const RegisterRepaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  currentConsumed,
}) => {
  const [repaymentType, setRepaymentType] = useState("PARTIAL");
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRepaymentType("PARTIAL");
      setRepaymentAmount("");
      setReferenceNumber("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (repaymentType === "FULL") {
      const exactAmount = Number(currentConsumed).toFixed(2);
      setRepaymentAmount(exactAmount);
    } else {
      setRepaymentAmount("");
    }
  }, [repaymentType, currentConsumed]);

  if (!isOpen) return null;

  const formatDisplayAmount = (val) => {
    if (!val) return "";
    const parts = val.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (/^\d*\.?\d{0,2}$/.test(rawValue)) {
      setRepaymentAmount(rawValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(repaymentAmount);

    if (isNaN(amount) || amount <= 0) {
      Swal.fire(
        "Atención",
        "Por favor ingresa un monto válido mayor a 0.",
        "warning",
      );
      return;
    }

    if (amount > currentConsumed) {
      Swal.fire(
        "Monto Excedido",
        "El abono no puede ser mayor al consumo actual de la línea.",
        "warning",
      );
      return;
    }

    if (!referenceNumber.trim()) {
      Swal.fire(
        "Atención",
        "Debe especificar el número de comprobante o referencia de pago.",
        "warning",
      );
      return;
    }

    onConfirm({ amount, reference: referenceNumber, type: repaymentType });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-md font-bold text-slate-800">
              Registrar Abono a Línea
            </h3>
            <p className="text-xs text-slate-500">
              Libera cupo disponible para factoraje
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
          >
            <Icon path={mdiClose} size={0.9} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Consumo actual a Redimir
            </label>
            <div className="bg-red-50 text-red-800 font-mono font-bold text-sm p-3 rounded-xl border border-red-100 flex justify-between items-center">
              <span>Monto consumido:</span>
              <span>
                ${" "}
                {Number(currentConsumed).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Tipo de redención
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${repaymentType === "PARTIAL" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                <input
                  type="radio"
                  name="repaymentType"
                  value="PARTIAL"
                  checked={repaymentType === "PARTIAL"}
                  onChange={() => setRepaymentType("PARTIAL")}
                  className="hidden"
                />
                <Icon path={mdiCurrencyUsd} size={0.7} />
                <span className="text-xs font-bold">Pago parcial</span>
              </label>
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${repaymentType === "FULL" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                <input
                  type="radio"
                  name="repaymentType"
                  value="FULL"
                  checked={repaymentType === "FULL"}
                  onChange={() => setRepaymentType("FULL")}
                  className="hidden"
                />
                <Icon path={mdiFormatListChecks} size={0.7} />
                <span className="text-xs font-bold">Liquidación total</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Monto del Abono ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold">$</span>
              </div>
              <input
                type="text"
                required
                placeholder="0.00"
                value={formatDisplayAmount(repaymentAmount)}
                onChange={handleAmountChange}
                disabled={repaymentType === "FULL" || isProcessing}
                className={`w-full border rounded-xl text-sm py-3 pr-4 pl-8 font-mono text-slate-800 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all ${repaymentType === "FULL" ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-bold" : "bg-slate-50 border-slate-200 shadow-inner"}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Referencia / Comprobante de Pago
            </label>
            <input
              type="text"
              required
              placeholder="Ej: DEP-9827364-DAV"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm p-3 text-slate-700 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Icon path={mdiLoading} size={0.6} className="animate-spin" />{" "}
                  Aplicando abono...
                </>
              ) : (
                <>
                  <Icon path={mdiCheckCircleOutline} size={0.7} /> Aplicar y
                  restaurar cupo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =======================================================================
// COMPONENTE PRINCIPAL
// =======================================================================
const PayerCreditLineManager = () => {
  const [payersList, setPayersList] = useState([]);
  const [activePayer, setActivePayer] = useState("");
  const [isLoadingPayers, setIsLoadingPayers] = useState(true);
   const { userData } = useAuth();

  const [creditLineData, setCreditLineData] = useState(null);
  const [repaymentHistory, setRepaymentHistory] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessingAbono, setIsProcessingAbono] = useState(false);

  // 1. CARGA DE PAGADORES (Al montar el componente)
  // 1. CARGA DE PAGADORES (Al montar el componente)
  useEffect(() => {
    const fetchPayers = async () => {
      try {
        const response = await creditLineService.getPayers();

        // La respuesta ya es el JSON de Spring Boot. Accedemos directo a su .data
        const serverPayers = response.data;

        setPayersList(serverPayers || []);

        if (serverPayers && serverPayers.length > 0) {
          setActivePayer(serverPayers[0].id);
        }
      } catch (error) {
        console.error("Error al cargar la lista de pagadores:", error);
      } finally {
        setIsLoadingPayers(false);
      }
    };

    fetchPayers();
  }, []);

  // 2. CARGA DE DETALLES DE LÍNEA (Al cambiar el pagador seleccionado)
  const loadCreditLineData = useCallback(async (payerId) => {
    if (!payerId) return;

    try {
      const response =
        await creditLineService.getPayerCreditLineDetails(payerId);

      // 1. response.data nos da el JSON de Spring Boot: { success: true, data: { metrics, history } }
      const springJson = response.data;

      // 2. Extraemos la data real que viene adentro del cascarón de Spring
      if (springJson && springJson.data) {
        setCreditLineData(springJson.data.metrics);
        setRepaymentHistory(springJson.data.history || []);
      }
    } catch (error) {
      console.error(
        "Error al obtener la línea de crédito desde la API:",
        error,
      );
      setCreditLineData({
        totalLimit: 0,
        currentConsumed: 0,
        availableLimit: 0,
        utilizationRate: 0,
      });
      setRepaymentHistory([]);
    }
  }, []);

  useEffect(() => {
    loadCreditLineData(activePayer);
  }, [activePayer, loadCreditLineData]);

  // 3. REGISTRO DE ABONO
  const handleExecuteRepayment = async (repaymentPayload) => {
    setIsProcessingAbono(true);

    try {
      const apiPayload = {
        payerId: activePayer,
        amount: repaymentPayload.amount,
        reference: repaymentPayload.reference,
        type: repaymentPayload.type,
        userId: userData?.id
      };

      await creditLineService.restoreCreditLine(apiPayload);

      setIsModalOpen(false);
      Swal.fire({
        title: "¡Abono Aplicado!",
        text: `Se han restaurado $${repaymentPayload.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} a la línea de crédito.`,
        icon: "success",
        confirmButtonColor: "#dc2626",
      });

      await loadCreditLineData(activePayer); // Recarga saldos reales desde BD
    } catch (error) {
      Swal.fire("Transacción rechazada", error.message, "error");
    } finally {
      setIsProcessingAbono(false);
    }
  };

  const data = creditLineData || {
    totalLimit: 0,
    currentConsumed: 0,
    availableLimit: 0,
    utilizationRate: 0,
  };

  return (
    <div className="flex flex-col w-full font-sans max-w-7xl mx-auto p-2">
      {/* ================= CABECERA Y SELECTOR DE PAGADOR ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-xl text-red-600 hidden sm:block">
            <Icon path={mdiDomain} size={1.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Mesa de líneas de crédito
            </h2>
            <p className="text-sm text-slate-500">
              Monitoreo y redención de líneas de crédito
            </p>
          </div>
        </div>

        <div className="w-full md:w-96 relative">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
            Seleccionar cliente
          </label>
          <select
            value={activePayer}
            onChange={(e) => setActivePayer(e.target.value)}
            disabled={isLoadingPayers || payersList.length === 0}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            {isLoadingPayers ? (
              <option value="">Cargando clientes...</option>
            ) : payersList.length === 0 ? (
              <option value="">No hay clientes registrados</option>
            ) : (
              payersList.map((payer) => (
                <option key={payer.id} value={payer.id}>
                  {payer.name}
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-5 text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN ÚNICA DE GESTIÓN ================= */}
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col relative w-full">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-bl-full -z-10 opacity-60"></div>

          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-3 rounded-xl">
                <Icon
                  path={mdiCreditCardSettings}
                  size={1.3}
                  className="text-red-600"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
                  Línea de Crédito Rotativa
                </h3>
                <p className="text-sm text-slate-400">
                  Cupos autorizados para anticipo de facturas
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={data.currentConsumed <= 0}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm border flex items-center gap-2 transition-all ${data.currentConsumed > 0 ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 active:scale-95" : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"}`}
            >
              <Icon path={mdiCashRegister} size={0.8} /> Registrar abono
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-2">
            <div className="border-r border-slate-100 pr-4">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                Cupo Total Autorizado
              </p>
              <p className="text-3xl font-black font-mono text-slate-800">
                ${" "}
                {Number(data.totalLimit).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="border-r border-slate-100 pr-4">
              <p className="text-xs uppercase font-bold text-red-500 tracking-wider mb-1">
                Consumo actual
              </p>
              <p className="text-3xl font-black font-mono text-red-600">
                ${" "}
                {Number(data.currentConsumed).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-emerald-600 tracking-wider mb-1">
                Cupo Neto Disponible
              </p>
              <p className="text-3xl font-black font-mono text-emerald-600">
                ${" "}
                {Number(data.availableLimit).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
              <span>Porcentaje de Ocupación de Línea</span>
              <span
                className={
                  data.utilizationRate > 80 ? "text-red-600" : "text-slate-700"
                }
              >
                {data.utilizationRate}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${data.utilizationRate > 85 ? "bg-gradient-to-r from-red-500 to-red-700" : "bg-gradient-to-r from-red-500 to-red-600"}`}
                style={{ width: `${Math.min(data.utilizationRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* HISTORIAL RECIENTE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden w-full flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Icon path={mdiHistory} size={1} className="text-slate-400" />
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Historial de Redenciones a la Línea
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Referencia</th>
                  <th className="px-6 py-4">Fecha Aplicación</th>
                  <th className="px-6 py-4 text-center">Operador</th>
                  <th className="px-6 py-4 text-right">Monto Restaurado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                {repaymentHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-slate-400 text-sm"
                    >
                      No hay abonos registrados para este pagador.
                    </td>
                  </tr>
                ) : (
                  repaymentHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.reference}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(item.date).toLocaleString("es-SV")}
                      </td>
                      <td className="px-6 py-4 text-center bg-slate-50/40">
                        {item.operator}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono text-base">
                        + ${" "}
                        {Number(item.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RegisterRepaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleExecuteRepayment}
        isProcessing={isProcessingAbono}
        currentConsumed={data.currentConsumed}
      />
    </div>
  );
};

export default PayerCreditLineManager;
