// ==========================================
// 1. IMPORTS
// ==========================================

import React, { useState, useMemo, useEffect } from "react";
import { FaCog, FaSearch, FaTimes, FaPlus, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes propios
import Table from "../../components/Table";
import HeaderCard from "../../components/HeaderCard";
import Modal from "../../components/Modal";

// Servicios y Esquemas
import { userService } from "../../services/admin/userService";
import { entityService } from "../../services/admin/entityService";
import { roleService } from "../../services/admin/roleService";
import { userSchema } from "../../schemas/userSchema";

// ==========================================
// 2. CONSTANTES Y FUNCIONES AUXILIARES
// ==========================================

const columns = [
  { header: "DUI", accessor: "dui" },
  { header: "NOMBRE", accessor: "name" },
  { header: "EMAIL", accessor: "email" },
  { header: "ENTIDAD", accessor: "entityName" },
  { header: "ROL", accessor: "roleName" },
];

const ITEMS_PER_PAGE = 8;

const formatDUIFormat = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 8) return digits;
  return `${digits.slice(0, 8)}-${digits.slice(8, 9)}`;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

const UserManagement2 = () => {

  // ------------------------------------------
  // 4. ESTADOS DE REACT
  // ------------------------------------------

  const [users, setUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // 5. HOOKS DE LIBRERÍAS 
  // ------------------------------------------

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      dui: "",
      entityId: "",
      roleId: "",
    },
  });

  const watchDui = watch("dui", "");

  // ------------------------------------------
  // 6. EFECTOS (Peticiones API)
  // ------------------------------------------

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error al cargar usuarios de forma segura");
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Cargar entidades
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await entityService.getTotalEntities();
        if (response) {
          setEntities(response);
        } else {
          setEntities([]);
        }
      } catch (error) {
        console.error("Error al cargar entidades");
        setEntities([]);
      }
    };
    fetchEntities();
  }, []);

  // Cargar roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getRoles();
        if (response.status === 200) {
          setRoles(response.data);
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error("Error al cargar roles");
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // ------------------------------------------
  // 7. MEMORIZACIONES (useMemo para búsquedas y paginación)
  // ------------------------------------------

  const filteredData = useMemo(() => {
    let data = Array.isArray(users) ? [...users] : [];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          (item.name?.toLowerCase() || "").includes(lowSearch) ||
          (item.dui?.toLowerCase() || "").includes(lowSearch) ||
          (item.entityName?.toLowerCase() || "").includes(lowSearch),
      );
    }
    return data;
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // ------------------------------------------
  // 8. MANEJADORES DE EVENTOS (Handlers)
  // ------------------------------------------

  // Guardar / Actualizar Usuario
  const onSubmit = async (data) => {
    Swal.fire({
      title: "Procesando...",
      text: "Guardando los cambios, por favor espere.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const selectedEntity = entities.find(
        (e) => e.id.toString() === data.entityId,
      );
      const selectedRole = roles.find(
        (r) => r.role_id.toString() === data.roleId,
      );

      const payload = {
        ...data,
        entityName: selectedEntity ? selectedEntity.name : "",
        roleName: selectedRole ? selectedRole.roleName : "",
      };

      if (editingParam) {
        await userService.updateUser(editingParam.id, payload);
      } else {
        await userService.createUser(payload);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: editingParam
          ? "Usuario actualizado correctamente."
          : "Usuario registrado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      const response = await userService.getUsers();
      setUsers(response.data);
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la información. Intenta de nuevo.",
      });
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingParam(null);
    reset({ name: "", email: "", dui: "", entityId: "", roleId: "" });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (param) => {
    setEditingParam(param);
    reset({
      name: param.name || "",
      email: param.email || "",
      dui: param.dui || "",
      entityId: param.entityId ? param.entityId.toString() : "",
      roleId: param.roleId ? param.roleId.toString() : "",
    });
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParam(null);
    reset();
  };

  // Eliminar usuario
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
        const response = await userService.deleteUser(param.id);
        if (response.status === 204) {
          await Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El usuario ha sido removido del sistema.",
            timer: 1500,
            showConfirmButton: false,
          });
          const updatedList = await userService.getUsers();
          setUsers(updatedList.data);
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
        title={"Gestion de usuarios"}
        buttonText={"usuario"}
        onButtonClick={handleCreate}
        description={"Administre los usuarios registrados en el sistema"}
        icon={<FaUsers />}
      />

      <div className="border-b border-gray-200 mb-4"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-1/3 md:max-w-md shadow-sm rounded-lg transition-shadow hover:shadow-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <FaSearch />
          </div>

          <input
            type="text"
            aria-label="Buscar usuario"
            placeholder="Buscar usuario por DUI, nombre o entidad"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 font-montserrat placeholder:text-xs placeholder:text-gray-400 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 transition-all duration-200"
          />

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
          className="font-montserrat flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md font-medium shadow-lg hover:cursor-pointer transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          <FaPlus className="mr-2" />
          <span className="text-xs font-montserrat">Registrar usuario</span>
        </button>
      </div>

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
            ? "Modificar información del usuario"
            : "Registrar nuevo usuario"
        }
        footer={
          <>
            <button
              onClick={handleCloseModal}
              className="py-2 px-4 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="py-2 px-4 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 shadow-md hover:cursor-pointer"
            >
              {editingParam ? "Guardar cambios" : "Registrar"}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Nombre</label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.name ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">E-mail</label>
            <input
              type="text"
              {...register("email")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.email ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">DUI</label>
            <input
              type="text"
              maxLength={10}
              value={formatDUIFormat(watchDui)}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/\D/g, "");
                setValue("dui", cleanValue.slice(0, 9), {
                  shouldValidate: true,
                });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat ${errors.dui ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
              placeholder="00000000-0"
            />
            {errors.dui && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.dui.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Entidad</label>
            <select
              {...register("entityId")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat bg-white ${errors.entityId ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            >
              <option value="">Seleccione una entidad</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
            {errors.entityId && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.entityId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Rol</label>
            <select
              {...register("roleId")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs font-montserrat bg-white ${errors.roleId ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-red-300"}`}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.roleName}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.roleId.message}
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement2;
