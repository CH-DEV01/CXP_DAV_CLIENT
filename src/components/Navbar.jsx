import React from 'react';
import logo from '../assets/Davivienda-Logo.png';
import Icon from '@mdi/react';
import { mdiLogout, mdiShieldHome, mdiChevronDown, mdiCloudSync } from '@mdi/js';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { logout, user, userData } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeItem, setActiveItem] = useState('inicio');
    const navigate = useNavigate();

    const location = useLocation(); 
    const currentPath = location.pathname; 

    const isHistoryActive = currentPath.includes('history');
    
    const isInicioActive = !isHistoryActive

    const handleLogout = () => {
        logout();
    };

    const handleItemClick = (item) => {
        switch (item) {
            case 'inicio':
                switch(user.role){
                    case 'AUTHORIZING_TWO_MODE_AUTH':
                        navigate('/payer-two');
                        break;
                    case 'MANAGER':
                        navigate('/admin');
                        break;
                    case 'SUPPLIER':
                        navigate('/supplier')
                }
                break;
            case 'history':
                switch(user.role) {
                    case 'PAYER':
                        navigate('/payer/documents-history');
                    case 'SUPPLIER':
                        navigate('/supplier/documents-history');
                        break;
                    case 'MANAGER':
                        navigate('/admin/documents-history'); // (Debes crear esta ruta en App.js)
                        break;
                }
                break;
        }
    };

    useState(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`font-montserrat fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-gradient-to-r from-red-600 to-red-800 bg-red-800 shadow-xl py-1.5' : 'bg-gradient-to-r from-red-600 to-red-800 bg-red-800 py-2'}`}>
            <div className="max-w-8xl mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white p-1.5 rounded-lg shadow-md">
                            <img
                                src={logo}
                                alt="Davivienda"
                                className="h-8 object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200 tracking-wider uppercase">
                                Banca empresas
                            </span>
                            <h1 className="text-xs text-white leading-tight">
                                {/* Financiamiento de cuentas&nbsp;-&nbsp; */}
                                <span className="font-extrabold font-monserrat tracking-wider drop-shadow-sm">
                                    FINANCIAMIENTO DE CUENTAS POR PAGAR
                                </span>
                            </h1>
                        </div>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => handleItemClick('inicio')}
                            className={`hover:bg-red-600 shadow-lg flex items-center space-x-2
                                        px-3 py-2 rounded-lg text-sm font-medium transition-all 
                                        duration-300 cursor-pointer 
                                        ${
                                            isInicioActive
                                            ? 'text-white bg-red-600 shadow-inner'
                                            : 'text-gray-200 hover:text-white hover:bg-red-700/60'
                                        }`}
                        >
                            <Icon path={mdiShieldHome} size={1} />
                            <span>INICIO</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleItemClick('history')}
                            className={`hover:bg-red-600 shadow-lg flex items-center space-x-2
                                        px-3 py-2 rounded-lg text-sm font-medium transition-all 
                                        duration-300 cursor-pointer
                                        ${
                                            isHistoryActive
                                            ? 'text-white bg-red-600 shadow-inner'
                                            : 'text-gray-200 hover:text-white hover:bg-red-700/60'
                                        }`}
                        >
                            <Icon path={mdiCloudSync} size={1} />
                            <span>BITACORA</span>
                        </button>
                        <p className="text-white p-0 m-0">|</p>
                        <div className="relative group">
                            <button className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-red-700/60 transition-all duration-300">
                                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="text-white font-medium text-xs">
                                        {userData?.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span>{userData?.name || 'Usuario'}</span>
                                <Icon path={mdiChevronDown} size={0.7} />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                                <button
                                    onClick={handleLogout}
                                    className="cursor-pointer flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Icon path={mdiLogout} size={0.9} className="text-red-600" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Navbar;