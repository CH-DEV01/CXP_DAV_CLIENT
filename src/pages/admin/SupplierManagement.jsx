import React, { useState, useMemo, useEffect } from "react";
import Table from "../../components/Table";
import HeaderCard from "../../components/HeaderCard";
import { FaCog, FaSearch, FaBuilding, FaTimes } from "react-icons/fa";
import Modal from "../../components/Modal";
import { entityService } from "../../services/admin/entityService";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";

const columns = [
  { header: "NIU", accessor: "niu" },
  { header: "CODIGO", accessor: "code" },
  { header: "NOMBRE", accessor: "name" },
  { header: "NIT", accessor: "nit" },
  { header: "CUENTA BANCARIA", accessor: "accountBank" },
];

const filters = [
  { id: "all", name: "Todos" },
  { id: "system", name: "Sistema" },
  { id: "security", name: "Seguridad" },
  { id: "uploads", name: "Carga de archivos" },
];

const SupplierManagement = () => {
  const [entities, setEntities] = useState([]);

  const ITEMS_PER_PAGE = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Lógica para carga la data al inicializar el componente
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await entityService.getSuppliers();
        if (response.status === 200) {
          setEntities(response.data);
          console.log(response.data);
        } else {
          console.error("Error fetching suppliers:", response.statusText);
          setEntities([]);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setEntities([]);
      }
    };
    fetchEntities();
  }, []);

  // -----------------------------------------

  // Lógica del modal

  const generarCodigo10Digitos = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const [formData, setFormData] = useState({
    codigo: generarCodigo10Digitos(),
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
    cuenta_bancaria: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    Swal.fire({
      title: "Procesando...",
      text: "Guardando los cambios, por favor espere.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (editingParam) {
        await entityService.updateSupplier(editingParam.id, formData);
      } else {
        await entityService.createPayer(formData);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: editingParam
          ? "Proveedor actualizado correctamente."
          : "Pagador registrado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      const response = await entityService.getSuppliers();
      setEntities(response.data);
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo proceder con la operación.",
      });
      console.error("Error al procesar la petición", error);
    }
  };

  const handleCreate = () => {
    setEditingParam(null);
    setFormData({
      codigo: generarCodigo10Digitos(),
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
    });
    setIsModalOpen(true);
  };

  const handleEdit = (param) => {
    setEditingParam(param);
    setFormData({
      codigo: param.code || "",
      cuenta_bancaria: param.accountBank || "",
      niu: param.niu || "",
      nombre: param.name || "",
      nit: param.nit || "",
      numero_linea_credito: param.creditLineNumber || "",
      politica_pago: param.paymentPolicy || "",
      tasa_interes: param.interestRate || "",
      tasa_comision: param.commissionRate || "",
      base_calculo: param.calculationBase || "",

      // Lógica inversa para seleccionar el Radio Button correcto:
      // Si en BD es true -> T_MAS_1, si es false -> DIA_ESPECIFICO
      tipo_desembolso:
        param.disbursementMethod === false ? "DIA_ESPECIFICO" : "T_MAS_1",

      // Si la base de datos devuelve un día, lo asignamos, si no, lo dejamos en blanco
      dia_semana: param.disbursementDay || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParam(null);
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
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await entityService.deletePayer(param.id);

        if (response.status === 204) {
          await Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El pagador ha sido removido del sistema.",
            timer: 1500,
            showConfirmButton: false,
          });

          const updatedList = await entityService.getEntities();
          setEntities(updatedList.data);
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No pudimos conectar con el servidor para eliminar el registro.",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // -----------------------------------------

  // Lógica de filtrado de la tabla y paginación

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

  // -----------------------------------------

  return (
    <div className="w-full min-h-screen">
      <HeaderCard
        title={"Gestion de proveedores"}
        buttonText={"pagador"}
        onButtonClick={handleCreate}
        description={"Administre los atributos de los proveedores del sistema"}
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
            aria-label="Buscar proveedor"
            placeholder="Buscar proveedor por NIU, nombre o NIT"
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
              onClick={handleSave}
              className="
                              py-2 px-4 rounded-lg text-xs font-medium 
                              bg-red-600 text-white 
                              hover:bg-red-700 shadow-md
                              hover:cursor-pointer
                            "
            >
              {editingParam ? "Guardar cambios" : "Guardar"}
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-2">
              Código (Autogenerado)
            </label>
            <input
              name="codigo"
              value={formData.codigo}
              readOnly
              type="text"
              className="
              w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed
              focus:outline-none text-xs font-montserrat text-gray-500
            "
            />
          </div>

          {/* NIU */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">NIU</label>
            <input
              name="niu"
              value={formData.niu}
              onChange={handleChange}
              type="text"
              className="
              w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
            "
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Nombre comercial
            </label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              type="text"
              className="
              w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
            "
            />
          </div>

          {/* NIT */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">NIT</label>
            <input
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              type="text"
              className="
              w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
            "
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Cuenta bancaria
            </label>
            <input
              name="cuenta_bancaria"
              value={formData.cuenta_bancaria}
              onChange={handleChange}
              type="text"
              className="
              w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
            "
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierManagement;
