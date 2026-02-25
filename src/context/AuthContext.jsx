import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';
import api from "../services/api";
import { authService } from '../services/auth/authService';
import { API_URL_PRODUCTION_AUTH } from "../constants/apiConstants";
import { API_URL_DEVELOP_AUTH } from "../constants/apiConstants";

export const ROLES = {
    MANAGER: "MANAGER",
    SUPPLIER: "SUPPLIER",
    AUTHORIZING: "AUTHORIZING",

    AUTHORIZING_TWO_MODE_AUTH: "AUTHORIZING_TWO_MODE_AUTH",
    SUPPLIER_TWO_MODE_AUTH: "SUPPLIER_TWO_MODE_AUTH",

    OPERATOR: "OPERATOR",
};

export const PERMISSIONS = {

    DASHBOARD_VIEW: 'dashboard_view', // Permiso para ver el dashboard de administración
    LINK_USER_VIEW: 'link_user_view', // Permiso para ver la gestión de usuarios
    AGREEMENT_MANAGEMENT_VIEW: 'agreement_management_view', // Permiso para ver la gestión de acuerdos
    PAYER_MANAGEMENT_VIEW: 'payer_management_view', // Permiso para ver la gestión de pagadores
    SUPPLIER_MANAGEMENT_VIEW: 'supplier_management_view', // Permiso para ver la gestión de proveedores
    UPLOAD_FILE_VIEW: 'view_upload_file_view', // Permiso para ver la carga de archivos

    SELECT_DOCUMENTS_VIEW: 'select_documents_view', // Permiso para ver la pagina de selección de documentos
    DOCUMENTS_SELECTED_VIEW: 'documents_selected_view', // Permiso para ver la pagina de documentos seleccionados

    APPROVE_DOCUMENTS_VIEW: 'approve_documents_view', // Permiso para ver la pagina de aprobación de documentos
    DOCUMENTS_APPROVED_VIEW: 'documents_approved_view', // Permiso para ver la pagina de documentos aprobados  

    // PERMISOS DE EJECUCIÓN DE ACCIONES //

    CREATE_PAYER_EXECUTE: 'create_payer_execute', // Permiso para crear un pagador
    LINK_USER_EXECUTE: 'link_user_execute', // Permiso para vincular un usuario a un rol
    UPLOAD_DOCUMENTS_EXECUTE: 'upload_documents_execute', // Permiso para subir documentos

    APPROVE_DOCUMENTS_EXECUTE: 'approve_documents_execute', // Permiso para aprobar documentos

    SELECT_DOCUMENTS_EXECUTE: 'select_documents_execute', // Permiso para seleccionar documentos

    SELECT_AGREEMENT_EXECUTE: 'select_agreement_execute', // Permiso para seleccionar un acuerdo

    // PERMISOS PARA MODO DE AUTENTICACIÓN DOS
    APPROVE_DOCUMENTS_TWO_MODE_AUTH_EXECUTE: 'approve_documents_two_mode_auth_execute',
    APPROVE_DOCUMENTS_TWO_MODE_AUTH_VIEW: 'approve_documents_two_mode_auth_view', // Permiso para ver la página de aprobación de documentos en modo de autenticación dos
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loginTime] = useState(null);

    const normalizeUserAuthorities = (apiData) => ({
        role: Object.values(ROLES).includes(apiData.ROLE) ? apiData.ROLE : ROLES.MANAGER,
        permissions: apiData.PERMISSIONS.filter(p => Object.values(PERMISSIONS).includes(p)),
    });

    useEffect(() => {
        const checkSession = async () => {
            setIsLoading(true); 
            try {
                const response = await axios.get('/validate-session', {
                    baseURL: API_URL_DEVELOP_AUTH,
                    withCredentials: true
                });

                if (response.data === true) {
                    await fetchUserAuthorities(); 
                } else {
                    setUser(null); 
                    sessionStorage.clear();
                }
            } catch (error) {
                console.error("Session validation failed:", error);
                setUser(null); 
                sessionStorage.clear();
            } finally {
                setIsLoading(false); 
            }
        };
        checkSession();
    }, []);

    const fetchUserAuthorities = async () => {
        try {
            const response = await api.get('/users/user');

            if (response.status !== 200) throw new Error("Sesión inválida");

            const apiData = {
                ROLE: response.data.role.roleName,
                PERMISSIONS: response.data.role.permissions.map(p => p.permissionName)
            };

            setUser(normalizeUserAuthorities(apiData));
            setUserData(response.data);
        } catch (error) {
            setUser(null);
            setUserData(null);
            sessionStorage.clear();
        }
    };

    const login = async (payload) => {
        //setIsLoading(true); 
        try {
            const response = await axios.post('/login', payload, {
                baseURL: API_URL_DEVELOP_AUTH,
                withCredentials: true
            });

            if (response.status !== 200) throw new Error("Login fallido");

            await fetchUserAuthorities();
            return response;

        } catch (error) {
            throw error;
        } finally {
            //setIsLoading(false); 
        }
    };

    const logout = async () => {
        setIsLoading(true); 
        // try {
        //     await axios.post('/logout', null, {
        //         baseURL: API_URL_DEVELOP_AUTH
        //     });
        // } catch (err) {
        //     console.error('Error al cerrar sesión:', err);
        // } finally {
        //     setUser(null);
        //     setUserData(null);
        //     setIsLoading(false); 
        //     sessionStorage.clear();
        // }
        try {

            setUser(null);
            setUserData(null);
            setIsLoading(false); 
            sessionStorage.clear();

        } catch (err) {
            console.error('Error al cerrar sesión: ', err);
        } finally {
            window.location.href = 'http://sv4106lap.daviviendasv.com/app/sso.nsf/api-open-app'
        }
    };

    const hasPermission = (permission) => (
        user?.permissions.includes(permission)
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                login,
                logout,
                hasPermission,
                fetchUserAuthorities,
                isLoading,
                setIsLoading,
                loginTime
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);