import React from "react"; 
import { FaDollarSign, FaChartLine, FaClipboardList, FaUsers, FaCog, FaBuilding, FaUniversity } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import WelcomeBannerCard from "../../components/Home/WelcomeBannerCard.jsx";
import { useAuth } from '../../context/AuthContext.jsx';

const menuItems = [
    {
        id: 'upload-file-admin',
        icon: FaClipboardList,
        title: 'Carga de documentos',
        description: 'Sube y gestiona los documentos clave de tu operación.',
    },
    {
        id: 'user-management',
        icon: FaUsers,
        title: 'Gestión de usuarios',
        description: 'Controla los usuarios vinculados y sus permisos en la plataforma.',
    },
    {
        id: 'payer-management-admin',
        icon: FaUniversity,
        title: 'Gestión de pagadores',
        description: 'Controla los pagadores vinculados en la plataforma.',
    },
    {
        id: 'supplier-management',
        icon: FaBuilding,
        title: 'Gestión de proveedores',
        description: 'Controla los proveedores vinculados en la plataforma.',
    },
    // {
    //     id: 'agreement-management',
    //     icon: FaDollarSign,
    //     title: 'Gestión de órdenes de pago',
    //     description: 'Supervisa y administra las órdenes de pago en cada etapa.',
    // },
    {
        id: 'params-management',
        icon: FaCog,
        title: 'Gestión de parámetros',
        description: 'Controla los usuarios vinculados y sus permisos en la plataforma.',
    },
];

const Menu = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); 

    const handleCardClick = (path) => {
        navigate(`/admin/${path}`);
    };

    const handleKeyDown = (e, path) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); 
            handleCardClick(path);
        }
    };

    return (
        <div className="min-h-screen">

            <div className="
                space-y-3 
                w-full
                max-w-8xl mx-auto
            ">
                
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleCardClick(item.id)}
                        role="button" 
                        tabIndex={0} 
                        onKeyDown={(e) => handleKeyDown(e, item.id)} 
                        
                        className="
                            group
                            bg-white font-montserrat rounded-xl shadow-lg 
                            p-4 flex flex-row items-center justify-between
                            cursor-pointer transition-all duration-300
                            hover:shadow-xl hover:-translate-y-1
                            border-b-4 border-transparent hover:border-red-500
                            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                        "
                    >
                        <div className="flex items-center gap-4">
                            <div className="
                                bg-red-100 p-2 rounded-full shadow-inner inline-block flex-shrink-0
                                transition-transform duration-300
                                group-hover:scale-105
                            ">
                                <item.icon className="text-red-500 text-xl" />
                            </div>

                            <div>
                                <h3 className="text-xs uppercase font-montserrat font-semibold text-gray-600 mb-0.5">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-600 leading-normal">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <div className="flex items-center text-red-600 font-medium">
                                <span className="text-xs">Administrar</span>
                                <svg className="h-4 w-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
                
            </div>
        </div>
    );
}

export default Menu;