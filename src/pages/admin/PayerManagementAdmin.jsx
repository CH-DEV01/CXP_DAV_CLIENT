// ==========================================
// 1. IMPORTS
// ==========================================

import React, { useState, useMemo, useEffect } from "react";
import { FaCog, FaSearch, FaBuilding, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes propios
import Table from "../../components/Table";
import HeaderCard from "../../components/HeaderCard";
import Modal from "../../components/Modal";

// Servicios y Esquemas
import { entityService } from "../../services/admin/entityService";
import { payerSchema } from "../../schemas/payerSchema";

// ==========================================
// 2. CONSTANTES Y FUNCIONES AUXILIARES
// ==========================================

const formatNIT = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");

  let formatted = "";
  if (digits.length > 0) formatted += digits.slice(0, 4);
  if (digits.length > 4) formatted += "-" + digits.slice(4, 10);
  if (digits.length > 10) formatted += "-" + digits.slice(10, 13);
  if (digits.length > 13) formatted += "-" + digits.slice(13, 14);

  return formatted;
};

// Función para darle formato de moneda ($ 000,000.00)
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";

  // 1. Limpiamos todo excepto números y el punto decimal
  let cleanValue = value.toString().replace(/[^0-9.]/g, "");

  // 2. Evitamos que el usuario escriba más de un punto decimal por error
  const parts = cleanValue.split(".");
  if (parts.length > 2) {
    cleanValue = parts[0] + "." + parts.slice(1).join("");
  }

  // 3. Separamos los enteros de los decimales para poner las comas
  const [integer, decimal] = cleanValue.split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 4. Retornamos con el símbolo $. Si hay decimales, permitimos máximo 2.
  if (decimal !== undefined) {
    return `$ ${formattedInteger}.${decimal.slice(0, 2)}`;
  }
  return `$ ${formattedInteger}`;
};

const generarCodigo8Digitos = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const columns = [
  { header: "NIU", accessor: "code" },
  { header: "NOMBRE", accessor: "name" },
  { header: "NIT", accessor: "nit" },
  { header: "N° LINEA CREDITO", accessor: "creditLineNumber" },
  { header: "POLITICA PAGO", accessor: "paymentPolicy" },
  { header: "% INTERES", accessor: "interestRate" },
  { header: "% COMISION", accessor: "commissionRate" },
  { header: "BASE CALCULO", accessor: "calculationBase" },
  {
    header: "TIPO DESEMBOLSO",
    accessor: "disbursementMethod",
    render: (value) => (value === true ? "T + 1" : "Día específico"),
  },
  {
    header: "DIA DESEMBOLSO",
    accessor: "disbursementDay",
    // Si hay un día lo mostramos, si está vacío (porque eligió T+1), mostramos 'N/A'
    render: (value) => (value ? value : "N/A"),
  },
];

const filters = [
  { id: "all", name: "Todos" },
  { id: "system", name: "Sistema" },
  { id: "security", name: "Seguridad" },
  { id: "uploads", name: "Carga de archivos" },
];

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

const PayerManagementAdmin = () => {
  // ------------------------------------------
  // 4. ESTADOS DE REACT
  // ------------------------------------------

  const [entities, setEntities] = useState([]);
  const ITEMS_PER_PAGE = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // 5. HOOKS DE LIBRERÍAS
  // ------------------------------------------

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(payerSchema),
    defaultValues: {
      codigo: "",
      niu: "",
      nombre: "",
      nit: "",
      numero_linea_credito: "",
      politica_pago: "",
      tasa_interes: "",
      tasa_comision: "",
      base_calculo: "",
      tipo_desembolso: "T_MAS_1",
      dia_semana: "",
      limite_linea_credito: "",
      consumo_actual: "",
    },
  });

  const watchNit = watch("nit", "");
  const tipoDesembolsoSeleccionado = watch("tipo_desembolso");
  const watchLimite = watch("limite_linea_credito", "");
  const watchConsumo = watch("consumo_actual", "");

  // ------------------------------------------
  // 6. EFECTOS (Peticiones API)
  // ------------------------------------------

  const fetchEntities = async () => {
    try {
      const response = await entityService.getEntities();
      if (response.status === 200) {
        setEntities(response.data);
      } else {
        setEntities([]);
      }
    } catch (error) {
      console.error("Error al cargar entidades");
      setEntities([]);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  // ------------------------------------------
  // 7. MEMORIZACIONES (useMemo para búsquedas y paginación)
  // ------------------------------------------

  const filteredData = useMemo(() => {
    let data = Array.isArray(entities) ? [...entities] : [];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          (item.name?.toLowerCase() || "").includes(lowSearch) ||
          (item.code?.toLowerCase() || "").includes(lowSearch) ||
          (item.nit?.toLowerCase() || "").includes(lowSearch),
      );
    }

    return data;
  }, [searchTerm, activeFilter, entities]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // ------------------------------------------
  // 8. MANEJADORES DE EVENTOS (Handlers)
  // ------------------------------------------

  const onSubmit = async (data) => {
    Swal.fire({
      title: "Procesando...",
      text: "Guardando los cambios, por favor espere.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const cleanNum = (str) => Number(str.replace(/[^0-9.-]/g, ""));

      const payload = {
        codigo: data.codigo,
        niu: data.niu,
        nombre: data.nombre,
        nit: data.nit.replace(/\D/g, ""), // Quitamos los guiones del NIT
        numero_linea_credito: data.numero_linea_credito,
        politica_pago: cleanNum(data.politica_pago),
        base_calculo: cleanNum(data.base_calculo),
        tasa_interes: cleanNum(data.tasa_interes) / 100, // Lo pasamos a decimal
        tasa_comision: cleanNum(data.tasa_comision) / 100, // Lo pasamos a decimal
        limite_linea_credito: cleanNum(data.limite_linea_credito),
        consumo_actual: cleanNum(data.consumo_actual),
        tipo_desembolso: data.tipo_desembolso,
        dia_semana: data.tipo_desembolso === "T_MAS_1" ? "" : data.dia_semana,
      };

      if (editingParam) {
        await entityService.updatePayer(editingParam.id, payload);
      } else {
        await entityService.createPayer(payload);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: editingParam
          ? "Pagador actualizado correctamente."
          : "Pagador registrado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchEntities();
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo proceder con la operación.",
      });
    }
  };

  const handleCreate = () => {
    setEditingParam(null);
    reset({
      codigo: generarCodigo8Digitos(),
      niu: "",
      nombre: "",
      nit: "",
      numero_linea_credito: "",
      politica_pago: "",
      tasa_interes: "",
      tasa_comision: "",
      base_calculo: "",
      tipo_desembolso: "T_MAS_1",
      dia_semana: "",
      limite_linea_credito: "",
      consumo_actual: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (param) => {
    setEditingParam(param);
    reset({
      codigo: param.code || "",
      niu: param.niu || "",
      nombre: param.name || "",
      nit: param.nit ? formatNIT(param.nit) : "",
      numero_linea_credito: param.creditLineNumber || "",
      politica_pago: param.paymentPolicy || "",
      // Convertimos decimales de vuelta a porcentajes para la vista
      tasa_interes: param.interestRate
        ? (Number(param.interestRate) * 100).toString()
        : "",
      tasa_comision: param.commissionRate
        ? (Number(param.commissionRate) * 100).toString()
        : "",
      base_calculo: param.calculationBase || "",
      tipo_desembolso:
        param.disbursementMethod === false ? "DIA_ESPECIFICO" : "T_MAS_1",
      dia_semana: param.disbursementDay || "",
      limite_linea_credito: param.credit_line_limit || "",
      consumo_actual: param.current_consumed || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParam(null);
    reset();
  };

  const handleDelete = async (param) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminarás "${param.name}". Esta operación no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Eliminando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await entityService.deletePayer(param.id);

        if (response.status === 204 || response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El pagador ha sido removido del sistema.",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchEntities();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No pudimos conectar con el servidor para eliminar el registro.",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // ------------------------------------------
  // 9. RENDERIZADO (JSX)
  // ------------------------------------------

  return (
    <div className="w-full min-h-screen">
      <HeaderCard
        title={"Gestion de pagadores"}
        buttonText={"pagador"}
        onButtonClick={handleCreate}
        description={"Administre los atributos de los pagadores del sistema"}
        icon={<FaBuilding />}
      />

      <div className="border-b border-gray-200 mb-4"></div>

      <div
        className=" 
              flex flex-col md:flex-row 
              items-center 
              justify-between
              gap-4
              
            "
      >
        {/* <div className="flex flex-wrap items-center justify-end gap-2">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => {
                                setActiveFilter(filter.id);
                                setCurrentPage(1);
                            }}
                            className={`
                                font-montserrat
                                shadow-md
                                hover:cursor-pointer
                                py-1 px-3 rounded-full text-xs font-medium transition-all
                                ${activeFilter === filter.id
                                    ? 'bg-red-600 text-white shadow-md' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                            `}
                        >
                            {filter.name}
                        </button>
                    ))}
                </div> */}
        <div className="relative w-full md:w-1/3 md:max-w-md shadow-sm rounded-lg transition-shadow hover:shadow-md">
          {/* Ícono de lupa */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <FaSearch />
          </div>

          <input
            type="text"
            aria-label="Buscar usuario"
            placeholder="Buscar pagador por NIU, nombre o NIT"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="
            w-full pl-10 pr-10 py-2 
            border border-gray-200 rounded-lg /* <--- Cambiado de rounded-full a rounded-lg */
            bg-white text-sm text-gray-700 font-montserrat
            placeholder:text-xs placeholder:text-gray-400
            focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 
            transition-all duration-200
        "
          />

          {/* Botón condicional para limpiar la búsqueda */}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors cursor-pointer"
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
        <button
          onClick={handleCreate}
          className="
                    font-montserrat
                    flex items-center           
                    bg-red-600 hover:bg-red-700
                    text-white 
                    py-2 px-6                
                    rounded-md
                    font-medium
                    shadow-lg
                    hover:cursor-pointer 
                    transition duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 
                    "
        >
          <FaPlus className="mr-2" />
          <span
            className="
                    text-xs                
                    font-montserrat
                    "
          >
            Registrar pagador
          </span>
        </button>
      </div>

      {/* <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div> */}

      <div className="mt-4">
        <Table
          columns={columns}
          data={paginatedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingParam
            ? "Modificar información del pagador"
            : "Registrar nuevo pagador"
        }
        footer={
          <>
            <button
              onClick={handleCloseModal}
              className="
                              py-2 px-4 rounded-lg text-xs font-medium 
                              bg-white text-gray-700 border border-gray-300 
                              hover:bg-gray-100
                              hover:cursor-pointer
                            "
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="py-2 px-4 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 shadow-md hover:cursor-pointer"
            >
              {editingParam ? "Guardar cambios" : "Guardar"}
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Código (Autogenerado)
            </label>
            <input
              {...register("codigo")}
              readOnly
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none text-xs font-montserrat text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              NIU
            </label>
            <input
              type="text"
              maxLength={14}
              {...register("niu", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.niu ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
              placeholder="Ej. 123456"
            />
            {errors.niu && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.niu.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Nombre comercial
            </label>
            <input
              type="text"
              {...register("nombre")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.nombre ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.nombre && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              NIT
            </label>
            <input
              type="text"
              maxLength={17}
              {...register("nit", {
                onChange: (e) => {
                  // Formateamos directamente la caja de texto añadiendo guiones
                  e.target.value = formatNIT(e.target.value);
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.nit ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
              placeholder="0000-000000-000-0"
            />
            {errors.nit && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.nit.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Número de línea de crédito
            </label>
            <input
              type="text"
              maxLength={14}
              {...register("numero_linea_credito", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.numero_linea_credito ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.numero_linea_credito && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.numero_linea_credito.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Política de pago (días)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              {...register("politica_pago", {
                // Interceptamos y borramos cualquier letra
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                },
              })}
              placeholder="Ej. 30, 60, 90"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.politica_pago ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.politica_pago && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.politica_pago.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Base de cálculo
            </label>
            <input
              type="number"
              step="1"
              min="1"
              {...register("base_calculo", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                },
              })}
              placeholder="Ej. 360"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.base_calculo ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.base_calculo && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.base_calculo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Tasa de interés (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("tasa_interes")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.tasa_interes ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.tasa_interes && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.tasa_interes.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Tasa de comisión (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("tasa_comision")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.tasa_comision ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.tasa_comision && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.tasa_comision.message}
              </p>
            )}
          </div>

          {/* Límite de línea de crédito */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Límite de línea de crédito
            </label>
            <input
              type="text" // Cambiado a text para soportar símbolos
              value={formatCurrency(watchLimite)}
              {...register("limite_linea_credito", {
                onChange: (e) => {
                  let cleanValue = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = cleanValue.split(".");
                  if (parts.length > 2)
                    cleanValue = parts[0] + "." + parts.slice(1).join("");
                  setValue("limite_linea_credito", cleanValue, {
                    shouldValidate: true,
                  });
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.limite_linea_credito ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
              placeholder="$ 0.00"
            />
            {errors.limite_linea_credito && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.limite_linea_credito.message}
              </p>
            )}
          </div>

          {/* Consumo actual */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Consumo actual
            </label>
            <input
              type="text" // Cambiado a text para soportar símbolos
              value={formatCurrency(watchConsumo)}
              {...register("consumo_actual", {
                onChange: (e) => {
                  let cleanValue = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = cleanValue.split(".");
                  if (parts.length > 2)
                    cleanValue = parts[0] + "." + parts.slice(1).join("");
                  setValue("consumo_actual", cleanValue, {
                    shouldValidate: true,
                  });
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.consumo_actual ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
              placeholder="$ 0.00"
            />
            {errors.consumo_actual && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.consumo_actual.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
            <label className="block text-xs font-bold text-gray-700 mb-3">
              Metodología de desembolso
            </label>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <label className="flex items-center text-xs text-gray-600 hover:cursor-pointer">
                <input
                  type="radio"
                  value="T_MAS_1"
                  {...register("tipo_desembolso")}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                T + 1 (Un día después)
              </label>

              <label className="flex items-center text-xs text-gray-600 hover:cursor-pointer">
                <input
                  type="radio"
                  value="DIA_ESPECIFICO"
                  {...register("tipo_desembolso")}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                Día específico de la semana
              </label>
            </div>

            {tipoDesembolsoSeleccionado === "DIA_ESPECIFICO" && (
              <div className="w-full md:w-1/2 transition-all duration-300 ease-in-out">
                <label className="block text-xs text-gray-600 mb-2">
                  Seleccione el día de pago
                </label>
                <select
                  {...register("dia_semana")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat bg-white ${errors.dia_semana ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
                >
                  <option value="" disabled>
                    -- Seleccione un día --
                  </option>
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miercoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                </select>
                {errors.dia_semana && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.dia_semana.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PayerManagementAdmin;
