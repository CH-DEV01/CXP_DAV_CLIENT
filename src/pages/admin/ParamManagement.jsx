// ==========================================
// 1. IMPORTS
// ==========================================

import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { FaCog, FaSearch } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes propios
import Table from "../../components/Table";
import HeaderCard from "../../components/HeaderCard";
import Modal from "../../components/Modal";

// Servicios y Esquemas
import { parametersService } from "../../services/admin/parameterService";
import { paramSchema } from "../../schemas/paramSchema";

// ==========================================
// 2. CONSTANTES Y FUNCIONES AUXILIARES
// ==========================================

const columns = [
  { header: "Clave", accessor: "param_key" },
  { header: "Valor", accessor: "param_value" },
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

const ParamsManagement = () => {
  // ------------------------------------------
  // 4. ESTADOS DE REACT
  // ------------------------------------------

  const [parameters, setParameters] = useState([]);
  const ITEMS_PER_PAGE = 5;
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paramSchema),
    defaultValues: {
      param_key: "",
      param_value: "",
    },
  });

  // ------------------------------------------
  // 6. EFECTOS (Peticiones API)
  // ------------------------------------------

  // 1. Declaramos la función AFUERA para que todo el componente pueda verla
  const fetchParams = async () => {
    try {
      const response = await parametersService.getParameters();
      if (response.status === 200) {
        setParameters(response.data);
      } else {
        console.error("Error fetching params:", response.statusText);
        setParameters([]);
      }
    } catch (error) {
      console.error("Error fetching params:", error);
      setParameters([]);
    }
  };

  // 2. El useEffect ahora simplemente llama a la función que está afuera
  useEffect(() => {
    fetchParams();
  }, []);

  // ------------------------------------------
  // 7. MEMORIZACIONES
  // ------------------------------------------

  const filteredData = useMemo(() => {
    let data = Array.isArray(parameters) ? [...parameters] : [];

    if (activeFilter !== "all") {
      data = data.filter((item) => item.category === activeFilter);
    }

    // Sobre el resultado anterior, aplicamos la búsqueda
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          (item.param_key?.toLowerCase() || "").includes(lowSearch) ||
          (item.param_value?.toLowerCase() || "").includes(lowSearch) ||
          (item.description?.toLowerCase() || "").includes(lowSearch),
      );
    }

    return data;
  }, [searchTerm, activeFilter, parameters]);

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
      if (editingParam) {
        await parametersService.updateParameter(editingParam.id, data);
      } else {
        const response = await parametersService.createParameter(data);

        console.log(response);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: editingParam
          ? "Parámetro actualizado correctamente."
          : "Parámetro creado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchParams();
      handleCloseModal();
    } catch (error) {
      console.error("El error real es:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la información. Intenta de nuevo.",
      });
    }
  };

  const handleCreate = () => {
    setEditingParam(null);
    reset({
      param_key: "",
      param_value: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (param) => {
    setEditingParam(param);
    reset({
      param_key: param.param_key || "",
      param_value: param.param_value || "",
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
      text: `Eliminarás "${param.param_key}". Esta operación no se puede deshacer.`,
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
        const response = await parametersService.deleteParameter(param.id);

        if (response.status === 204 || response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El parámetro ha sido removido del sistema.",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchParams();
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
        title={"Gestion de parametros"}
        buttonText={"parámetro"}
        onButtonClick={handleCreate}
        description={"Administre parámetros globales del sistema"}
        icon={<FaCog />}
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
        <div className="relative w-1/3 shadow-lg rounded-full">
          <input
            type="text"
            placeholder="Buscar en el sistema por clave o valor"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="
                            placeholder:text-xs
                            placeholder:font-montserrat
                            
                            w-full pl-10 pr-4 py-2 
                            border border-gray-200 rounded-full
                            bg-white 
                            focus:outline-none focus:ring-2 focus:ring-red-300 
                            text-sm
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
            Registrar parámetro
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
        title={editingParam ? "Modificar Parámetro" : "Crear nuevo parámetro"}
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
              {editingParam ? "Guardar cambios" : "registrar"}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Clave (Key) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("param_key")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.param_key ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.param_key && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.param_key.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Valor (Value) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("param_value")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.param_value ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.param_value && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.param_value.message}
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParamsManagement;
