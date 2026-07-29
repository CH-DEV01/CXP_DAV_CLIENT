// ==========================================
// 1. IMPORTS
// ==========================================

import React, { useState, useMemo, useEffect } from "react";
import { FaCalendarAlt, FaSearch, FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes propios
import Table from "../../components/Table";
import HeaderCard from "../../components/HeaderCard";
import Modal from "../../components/Modal";

// Servicios y Esquemas
import { holidayService } from "../../services/admin/holidayService"; // Ajusta la ruta
import Swal from "sweetalert2";
import { holidaySchema } from "../../schemas/holidaySchema";

// ==========================================
// 2. CONSTANTES Y FUNCIONES AUXILIARES
// ==========================================

// Formateador de fecha seguro (evita problemas de zona horaria)
const formatDateSafely = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const columns = [
  {
    header: "Fecha del dia feriado",
    accessor: "holidayDate",
    render: (val) => (
      <span className="font-semibold text-slate-700">
        {formatDateSafely(val)}
      </span>
    ),
  },
  { header: "Descripcion", accessor: "description" },
];

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

const HolidaysManagement = () => {
  // ------------------------------------------
  // 4. ESTADOS DE REACT
  // ------------------------------------------

  const [holidays, setHolidays] = useState([]);
  const ITEMS_PER_PAGE = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // 5. HOOKS DE LIBRERÍAS
  // ------------------------------------------

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      holidayDate: "",
      description: "",
    },
  });

  // ------------------------------------------
  // 6. EFECTOS (Peticiones API)
  // ------------------------------------------

  const fetchHolidays = async () => {
    try {
      const response = await holidayService.getHolidays();
      // Asumimos que axios devuelve status 200 y la data en response.data
      if (response.status === 200) {
        setHolidays(response.data);
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ------------------------------------------
  // 7. MEMORIZACIONES (useMemo)
  // ------------------------------------------

  const filteredData = useMemo(() => {
    let data = Array.isArray(holidays) ? [...holidays] : [];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          (item.description?.toLowerCase() || "").includes(lowSearch) ||
          (item.holidayDate?.toLowerCase() || "").includes(lowSearch),
      );
    }
    return data;
  }, [searchTerm, holidays]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;

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
      if (editingHoliday) {
        await holidayService.updateHoliday(editingHoliday.id, data);
      } else {
        await holidayService.createHoliday(data);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: editingHoliday
          ? "Día feriado actualizado correctamente."
          : "Día feriado registrado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchHolidays();
      handleCloseModal();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "No se pudo guardar la información. Intenta de nuevo.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  };

  const handleCreate = () => {
    setEditingHoliday(null);
    reset({ holidayDate: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    reset({
      holidayDate: holiday.holidayDate || "",
      description: holiday.description || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHoliday(null);
    reset();
  };

  const handleDelete = async (holiday) => {
    const formattedDate = formatDateSafely(holiday.holidayDate);

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminarás el día feriado del ${formattedDate} (${holiday.description}). Esta operación no se puede deshacer.`,
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
        const response = await holidayService.deleteHoliday(holiday.id);
        if (response.status === 204 || response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El día feriado ha sido removido del sistema.",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchHolidays();
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
        title={"Calendario de días feriados"}
        buttonText={"asueto"}
        onButtonClick={handleCreate}
        description={"Administre los días feriados no laborables para el banco"}
        icon={<FaCalendarAlt />}
      />

      <div className="border-b border-gray-200 mb-4"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-1/3 shadow-sm rounded-full">
          <input
            type="text"
            placeholder="Buscar asueto por descripción o fecha..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="
                            placeholder:text-xs
                            placeholder:font-montserrat
                            w-full pl-10 pr-4 py-2.5 
                            border border-gray-200 rounded-full
                            bg-gray-50 hover:bg-gray-100 focus:bg-white 
                            focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400
                            text-sm transition-colors duration-300
                        "
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <FaSearch className="text-gray-400" />
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="
                        font-montserrat
                        flex items-center          
                        bg-red-600 hover:bg-red-700
                        text-white 
                        py-2.5 px-6                
                        rounded-lg
                        font-medium
                        shadow-md
                        hover:cursor-pointer 
                        transition duration-300 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 
                    "
        >
          <FaPlus className="mr-2" />
          <span className="text-xs font-montserrat">Registrar día feriado</span>
        </button>
      </div>

      <div className="mt-6">
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

      {/* MODAL PARA CREAR/EDITAR */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingHoliday ? "Modificar día feriado" : "Registrar nuevo día feriado"}
        footer={
          <>
            <button
              onClick={handleCloseModal}
              className="
                              py-2 px-4 rounded-lg text-xs font-medium 
                              bg-white text-gray-700 border border-gray-300 
                              hover:bg-gray-100 hover:cursor-pointer transition-colors
                            "
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="py-2 px-4 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 shadow-md hover:cursor-pointer transition-colors"
            >
              {editingHoliday ? "Guardar cambios" : "Registrar"}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Fecha del día feriado <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("holidayDate")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm font-montserrat ${errors.holidayDate ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.holidayDate && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.holidayDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Descripción / Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Ej. Fiestas Agostinas"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm font-montserrat resize-none ${errors.description ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.description && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidaysManagement;
