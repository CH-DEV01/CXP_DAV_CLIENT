import React, { useState, useMemo } from "react";
import Table from "../../components/Table"; 
import HeaderCard from "../../components/HeaderCard";
import { FaCog, FaSearch } from 'react-icons/fa';
import Modal from "../../components/Modal"

const columns = [
    { header: 'Clave', accessor: 'key' },
    { header: 'Valor', accessor: 'value' },
    { header: 'Descripción', accessor: 'description' }
];

const mockData = [
    { id: 1, key: 'MAX_UPLOAD_SIZE_MB', value: '25', description: 'Tamaño máximo de subida de archivos (en MB).', category: 'uploads' },
    { id: 2, key: 'MAINTENANCE_MODE', value: 'false', description: 'Pone el sitio en modo mantenimiento.', category: 'system' },
    { id: 3, key: 'SESSION_TIMEOUT_MINS', value: '30', description: 'Minutos de inactividad para expirar sesión.', category: 'security' },
    { id: 4, key: 'DEFAULT_CURRENCY', value: 'USD', description: 'Moneda por defecto del sistema.', category: 'system' },
    { id: 5, key: 'ALLOW_FILE_TYPES', value: '.pdf,.jpg,.png', description: 'Tipos de archivo permitidos.', category: 'uploads' },
    { id: 6, key: 'ENABLE_2FA', value: 'true', description: 'Habilitar autenticación de dos factores.', category: 'security' },
];

const filters = [
    { id: 'all', name: 'Todos' },
    { id: 'system', name: 'Sistema' },
    { id: 'security', name: 'Seguridad' },
    { id: 'uploads', name: 'Carga de archivos' }
];

const ParamsManagement = () => {

    const ITEMS_PER_PAGE = 5; 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParam, setEditingParam] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); 
    const [currentPage, setCurrentPage] = useState(1); 

    const handleCreate = () => {
        setEditingParam(null); 
        setIsModalOpen(true);
    };

    const handleEdit = (param) => {
        setEditingParam(param); 
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingParam(null); 
    };
    
    const handleSave = () => {
        if (editingParam) {
            console.log("Guardando cambios de:", editingParam);
        } else {
            console.log("Guardando nuevo parámetro...");
        }
        handleCloseModal(); 
    };

    const handleDelete = (param) => console.log("Eliminando:", param);

    const filteredData = useMemo(() => {

        let data = mockData;

        if (activeFilter !== 'all') {
            data = data.filter(item => item.category === activeFilter);
        }

        if (searchTerm) {
            data = data.filter(item =>
                item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return data;
    }, [searchTerm, activeFilter]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage]);


    return (
        <div>
            <HeaderCard
                title={"Gestion de parametros"}
                buttonText={"parámetro"}
                onButtonClick={handleCreate}
                description={"Administre parámetros globales del sistema"}
                icon={<FaCog />}
            />

            <div className="border-b border-gray-200 mb-4"></div>

            <div className=" 
              flex flex-col md:flex-row 
              items-center 
              justify-between 
              gap-4
              
            ">
                <div className="flex flex-wrap items-center justify-end gap-2">
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
                </div>
                <div className="relative w-full md:w-1/3 shadow-lg rounded-full"> 
                    <input
                        type="text"
                        placeholder="Buscar parámetro por nombre, valor ó descripción"
                        placeholder:text-xs
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
                            onClick={handleSave}
                            className="
                              py-2 px-4 rounded-lg text-xs font-medium 
                              bg-red-600 text-white 
                              hover:bg-red-700 shadow-md
                              hover:cursor-pointer
                            "
                        >
                            {editingParam ? "Guardar Cambios" : "Guardar"}
                        </button>
                    </>
                }
            >
                <form className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">
                            Clave (Key)
                        </label>
                        <input
                            type="text"
                            defaultValue={editingParam?.key || ''}
                            className="
                              w-full px-3 py-2 border border-gray-300 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
                            "
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">
                            Valor (Value)
                        </label>
                        <input
                            type="text"
                            defaultValue={editingParam?.value || ''}
                            className="
                              w-full px-3 py-2 border border-gray-300 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
                            "
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">
                            Descripción
                        </label>
                        <textarea
                            rows={3}
                            defaultValue={editingParam?.description || ''}
                            className="
                              w-full px-3 py-2 border border-gray-300 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-red-300 text-xs font-montserrat
                            "
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ParamsManagement;