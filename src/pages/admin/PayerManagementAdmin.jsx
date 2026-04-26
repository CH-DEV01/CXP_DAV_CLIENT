import React, { useState, useMemo, useEffect } from "react";
import Table from "../../components/Table"; 
import HeaderCard from "../../components/HeaderCard";
import { FaCog, FaSearch,  FaBuilding  } from 'react-icons/fa';
import Modal from "../../components/Modal"
import { entityService } from "../../services/admin/entityService";
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';

const columns = [
    { header: 'CODIGO', accessor: 'code' },
    { header: 'NOMBRE', accessor: 'name' },
    { header: 'NIT', accessor: 'nit' },
    { header: 'POLITICA DE PAGO', accessor: 'paymentPolicy' },
    { header: 'E-MAIL', accessor: 'email' }
];

const filters = [
    { id: 'all', name: 'Todos' },
    { id: 'system', name: 'Sistema' },
    { id: 'security', name: 'Seguridad' },
    { id: 'uploads', name: 'Carga de archivos' }
];

const PayerManagementAdmin = () => {

    const [ entities, setEntities ] = useState([]);

    const ITEMS_PER_PAGE = 5; 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParam, setEditingParam] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); 
    const [currentPage, setCurrentPage] = useState(1);

    // Lógica para carga la data al inicializar el componente
    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await entityService.getEntities();
                if (response.status === 200) {
                    setEntities(response.data);
                    console.log(response.data)
                } else {
                    console.error('Error fetching params:', response.statusText);
                    setEntities([]);
                }
            } catch (error) {
                console.error('Error fetching params:', error);
                setEntities([]);
            }
        };
        fetchEntities();
    }, []);

    // -----------------------------------------

    // Lógica del modal

    const [ formData, setFormData ] = useState({
        dui: '',
        name: '',
        entityName: '',
        roleName: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {

        Swal.fire({
            title: 'Procesando...',
            text: 'Guardando los cambios, por favor espere.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {

            if (editingParam) {
                await entitieservice.updateParameter(editingParam.id, formData);
            } else {
                await entitieservice.createParameter(formData);
            }
        
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: editingParam ? 'Parámetro actualizado correctamente.' : 'Parámetro creado con correctamente.',
                timer: 2000,
                showConfirmButton: false
            });

            const response = await entitiesService.getentities();
            setEntities(response.data);
            handleCloseModal();

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la información. Intenta de nuevo.',
            });
            console.error("Error al procesar la petición", error);
        }
    };

    const handleCreate = () => {
        setEditingParam(null); 
        setFormData({ 
            dui: '',
            name: '',
            entityName: '',
            roleName: ''     
        });
        setIsModalOpen(true);
    };

    const handleEdit = (param) => {

        setEditingParam(param);

        setFormData({

            dui: param.dui || '',
            name: param.name || '',
            entityName: param.entityName || '',
            roleName: param.roleName || ''

        });

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingParam(null); 
    };

    const handleDelete = async (param) => {

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Eliminarás "${param.name}". Esta operación no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626', 
            cancelButtonColor: '#4b5563', 
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true 
        });

        if (result.isConfirmed) {

            Swal.fire({
                title: 'Eliminando...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {

                const response = await entitiesService.deleteParameter(param.id);

                if (response.status === 204) {

                    await Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: 'El parámetro ha sido removido del sistema.',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    const updatedList = await entitiesService.getentities();
                    setEntities(updatedList.data);
                }
            } catch (error) {

                console.error("Error al eliminar:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No pudimos conectar con el servidor para eliminar el registro.',
                    confirmButtonColor: '#dc2626'
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
            data = data.filter(item => 
                (item.name?.toLowerCase() || "").includes(lowSearch) ||
                (item.code?.toLowerCase() || "").includes(lowSearch) ||
                (item.email?.toLowerCase() || "").includes(lowSearch)
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
                title={"Gestion de entidades"}
                buttonText={"entidad"}
                onButtonClick={handleCreate}
                description={"Administre los atributos de las entidades del sistema"}
                icon={<FaBuilding />}
            />

            <div className="border-b border-gray-200 mb-4"></div>

            <div className=" 
              flex flex-col md:flex-row 
              items-center 
              justify-between
              gap-4
              
            ">
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
                        placeholder="Buscar en el sistema por código o nombre"
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
                    <span className="
                    text-xs                
                    font-montserrat
                    ">
                    Registrar entidad
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
                <form className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">
                            Clave (Key)
                        </label>
                        <input
                            name="param_key"
                            value={formData.param_key}
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
                            Valor (Value)
                        </label>
                        <input
                            name="param_value"
                            value={formData.param_value}
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
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
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

export default PayerManagementAdmin;