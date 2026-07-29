import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';
import { payerService } from '../../services/admin/payerService.js';
import { authService } from "../../services/auth/authService.js";

const LinkUser = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const [entities, setEntities] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await payerService.getAllEntities();
                const rolesResponse = await authService.getRoles();

                if (response.status === 200 && rolesResponse.status === 200) {
                    setEntities(response.data);
                    setRoles(rolesResponse.data);
                } else {
                    console.error('Error fetching entities:', response.statusText);
                    console.error('Error fetching roles:', rolesResponse.statusText);
                }
            } catch (error) {
                console.error('Error fetching entities:', error);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        try {
            const response = await authService.linkUser(data);

            if (response.status >= 200 && response.status < 300) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'El usuario fue vinculado correctamente'
                }).then(() => {
                    reset(); 
                    window.location.reload();
                });
            } else if (response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Datos inválidos. Por favor verifica la información',
                    confirmButtonText: 'Aceptar'
                });
            } else if (response.status === 401 || response.status === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No autorizado',
                    text: 'No tienes permisos para realizar esta acción',
                    confirmButtonText: 'Aceptar'
                });
            } else if (response.status === 409) {
                Swal.fire({
                    icon: 'error',
                    title: 'Conflicto',
                    text: 'El usuario ya fue vinculado en el sistema',
                    confirmButtonText: 'Aceptar'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error inesperado',
                    confirmButtonText: 'Aceptar'
                });
            }

            return response;
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                confirmButtonText: 'Aceptar'
            });
            throw error;
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl flex flex-col justify-between shadow-sm w-1/4 font-montserrat border-2 border-gray-200">
            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <h2 className="text-xl font-bold mb-8 text-gray-800">Vinculación de usuarios</h2>

                    <div>
                        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                        <input
                            id="name"
                            {...register("name", {
                                required: "Este campo es obligatorio.",
                                minLength: {
                                    value: 3,
                                    message: "El nombre debe tener al menos 3 caracteres."
                                }
                            })}
                            className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-red-300'} rounded-md`}
                            placeholder="Nombre del usuario"
                        />
                        {errors.name && (
                            <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: "Este campo es obligatorio",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Ingrese un correo electrónico válido"
                                }
                            })}
                            className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-red-300'} rounded-md`}
                            placeholder="E-mail del usuario"
                        />
                        {errors.email && (
                            <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="dui" className="block text-gray-700 text-sm font-bold mb-2">DUI</label>
                        <input
                            id="dui"
                            type="number"
                            {...register("dui", {
                                required: "Este campo es obligatorio."
                            })}
                            className={`w-full p-2 border ${errors.dui ? 'border-red-500' : 'border-red-300'} rounded-md`}
                            placeholder="DUI del usuario"
                        />
                        {errors.dui && (
                            <p className="mt-1 text-red-500 text-sm">{errors.dui.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="entity" className="block text-gray-700 text-sm font-bold mb-2">Entidad</label>
                        <select
                            id="entity"
                            {...register("entityId", {
                                required: "Este campo es obligatorio."
                            })}
                            className={`w-full p-2 border ${errors.entityId ? 'border-red-500' : 'border-red-300'} rounded-md`}
                        >
                            <option value="">Seleccione una opción</option>
                            {entities.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {errors.entityId && (
                            <p className="mt-1 text-red-500 text-sm">{errors.entityId.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                        <select
                            id="role"
                            {...register("roleId", {
                                required: "Este campo es obligatorio."
                            })}
                            className={`w-full p-2 border ${errors.roleId ? 'border-red-500' : 'border-red-300'} rounded-md`}
                        >
                            <option value="">Seleccione una opción</option>
                            {roles.map((item) => (
                                <option key={item.role_id} value={item.role_id}>
                                    {item.roleName}
                                </option>
                            ))}
                        </select>
                        {errors.roleId && (
                            <p className="mt-1 text-red-500 text-sm">{errors.roleId.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-red-600 rounded-md text-white p-2 text-center cursor-pointer font-bold hover:bg-red-700 w-full"
                        >
                            Vincular
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LinkUser;