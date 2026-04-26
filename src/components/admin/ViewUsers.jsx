import React, { useState, useEffect } from "react";
import { authService } from '../../services/auth/authService';
import LoadingSpinner from '../LoadingSpinner';

const ViewUsers = () => {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authService.getUsers();
                if (response.status === 200) {
                    setUsers(response.data);
                } else {
                    console.error('Error fetching payers:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching payers:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-3/4">
            {users.length > 0 ? (
                <div className="bg-white shadow-sm rounded-2xl p-6 h-full border-2 border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-white rounded-lg text-gray-700 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">NOMBRE</th>
                                    <th className="py-3 px-6 text-left">DUI</th>
                                    <th className="py-3 px-6 text-left">Entidad</th>
                                    <th className="py-3 px-6 text-left">Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 hover:bg-indigo-50 transition duration-300 ease-in-out"
                                    >
                                        <td className="py-3 px-6 text-left whitespace-no-wrap">
                                            {user.name}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {user.dui}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                {user.entityName ? user.entityName : 'No asignada'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                                {user.roleName}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <LoadingSpinner></LoadingSpinner>
                // <div className="font-montserrat h-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border-2 border-gray-200">
                //     <svg
                //         xmlns="http://www.w3.org/2000/svg"
                //         viewBox="0 0 24 24"
                //         fill="none"
                //         stroke="currentColor"
                //         strokeWidth="1.5"
                //         className="w-16 h-16 text-red-400 mb-6"
                //     >
                //         <circle cx="12" cy="7.5" r="3.5" />
                //         <path
                //             strokeLinecap="round"
                //             strokeLinejoin="round"
                //             d="M4.5 19.5c0-3 5-4.5 7.5-4.5s7.5 1.5 7.5 4.5"
                //         />
                //         <path strokeLinecap="round" strokeLinejoin="round" d="M18 5v4M20 7h-4" />
                //     </svg>
                //     <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                //         No se han vinculado usuarios.
                //     </h3>
                //     <p className="text-gray-500 mb-6 text-center max-w-sm">
                //         Vincula tu primer usuario para comenzar a gestionar entidades y roles en la plataforma.
                //     </p>
                // </div>
            )}
        </div>
    );
};

export default ViewUsers;