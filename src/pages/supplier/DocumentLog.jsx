import React, { useState, useMemo } from "react";
import Table from "../../components/Table"; 
import HeaderCard from "../../components/HeaderCard";
import { FaCog, FaSearch } from 'react-icons/fa';
import Modal from "../../components/Modal"

    const getStatusChip = (status) => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-4 uppercase";
  
        switch (status) {
            case 'APROBADO':
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
            case 'SOLICITADO':
            return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
            case 'DESEMBOLSADO':
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
            default:
            return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
        }
    };

const columns = [
    { header: 'Número de documento', accessor: 'document_number' },
    { header: 'Fecha de emisión', accessor: 'issue_date' },
    { header: 'Fecha de desembolso', accessor: 'disbursement_date' },
    { header: 'Monto', accessor: 'amount' },
    { 
        header: 'Estado', 
        accessor: 'status',
        render: (estado) => getStatusChip(estado) 
    }
];

const mockData = [
    { id: 1, key: 'DOCUMENT_NUMBER', document_number: '001', issue_date: '08/12/2025', disbursement_date: '12/10/2025',  amount: '$500.00', status: 'APROBADO' }
];

const filters = [
    { id: 'all', name: 'Aprobado' },
    { id: 'system', name: 'Solicitado' },
    { id: 'security', name: 'Desembolsado' },
    { id: 'uploads', name: 'No disponible' }
];

const DocumentLog = () => {

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
            {/* <HeaderCard
                title={"Gestion de parametros"}
                buttonText={"parámetro"}
                onButtonClick={handleCreate}
                description={"Administre parámetros globales del sistema"}
                icon={<FaCog />}
            /> */}

            <div className=" 
              flex flex-col md:flex-row 
              items-center 
              justify-between 
              gap-4
              
            ">
                <div className="relative w-full md:w-1/4 shadow-lg rounded-md"> 
                    <input
                        type="text"
                        placeholder="Buscar documento"
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
                            border border-gray-200 rounded-md
                            bg-white 
                            focus:outline-none focus:ring-2 focus:ring-red-300 
                            text-sm
                        "
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FaSearch className="text-gray-400" />
                    </div>
                </div>
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

export default DocumentLog;