import React from 'react';
import { 
  FaPencilAlt, 
  FaTrashAlt, 
  FaInbox, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const Table = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false, // Nuevo prop para manejar el estado de carga
  onSort,            // Nuevo prop: función para ordenar
  sortColumn,        // Nuevo prop: columna actualmente ordenada
  sortDirection      // Nuevo prop: 'asc' o 'desc'
}) => {
  
  // Lógica para truncar la paginación (ej: 1, 2, ..., 8, 9, 10)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  // Helper para renderizar el ícono de ordenamiento
  const renderSortIcon = (columnAccessor) => {
    if (sortColumn !== columnAccessor) return <FaSort className="text-gray-300 group-hover:text-gray-400" />;
    if (sortDirection === 'asc') return <FaSortUp className="text-gray-700" />;
    return <FaSortDown className="text-gray-700" />;
  };

  return (
    <div className="sm:rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
      
      {/* Contenedor con altura dinámica y scrollbar personalizado */}
      <div className="h-[500px] overflow-auto bg-white 
                      [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                      [&::-webkit-scrollbar-track]:bg-transparent
                      [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
                      hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
      >
        <table className="min-w-full w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 font-semibold bg-gray-50 
                            hidden md:table-header-group sticky top-0 z-10 font-montserrat shadow-sm border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.accessor} 
                  scope="col" 
                  className={`px-6 py-4 tracking-wider uppercase ${col.sortable ? 'cursor-pointer hover:bg-gray-100 group transition-colors' : ''}`}
                  onClick={() => col.sortable && onSort && onSort(col.accessor)}
                >
                  <div className="flex items-center justify-start gap-2">
                    {col.header}
                    {col.sortable && onSort && renderSortIcon(col.accessor)}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="px-6 py-4 text-right tracking-wider uppercase">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          
          {/* Se usa divide-y para un look minimalista en lugar de filas de colores alternos */}
          <tbody className="bg-white divide-y divide-gray-100">
            
            {/* Estado de carga (Skeleton Loader) */}
            {isLoading && (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`loading-${idx}`} className="animate-pulse">
                  <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                </tr>
              ))
            )}

            {/* Empty State Profesional */}
            {!isLoading && (!data || data.length === 0) && (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="py-16">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="bg-gray-50 p-4 rounded-full mb-3 shadow-inner">
                      <FaInbox className="text-4xl text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 font-montserrat">No hay registros</p>
                    <p className="text-xs mt-1 text-gray-500">No se encontraron datos para mostrar en este momento.</p>
                  </div>
                </td>
              </tr>
            )}
            
            {/* Renderizado de datos */}
            {!isLoading && data.map((item) => (
              <tr
                key={item.id}
                className="text-xs font-montserrat block md:table-row mb-4 md:mb-0 hover:bg-gray-50 transition-colors duration-200"
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    data-label={col.header}
                    className="px-6 py-4 block md:table-cell text-right md:text-left 
                               border-b border-gray-100 md:border-none 
                               text-gray-700 whitespace-nowrap
                               before:content-[attr(data-label)] md:before:content-none 
                               before:font-semibold before:uppercase before:text-[10px] before:text-gray-400 
                               before:float-left md:before:float-none"
                  >
                    <span className="md:float-none font-medium text-gray-900">
                      {col.render 
                        ? col.render(item[col.accessor], item)
                        : item[col.accessor]
                      }
                    </span>
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td
                    className="px-6 py-4 block md:table-cell text-right border-b border-gray-100 md:border-none
                               md:space-x-2"
                  >
                    <span className="font-semibold uppercase text-[10px] text-gray-400 float-left md:hidden mt-2">
                      Acciones
                    </span>
                    
                    <div className="flex justify-end items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                          title="Modificar"
                        >
                          <FaPencilAlt />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-2 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-100"
                          title="Eliminar"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación Profesional */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3 bg-white border-t border-gray-200 gap-4">
          
          <div className="text-xs text-gray-500 font-montserrat text-center sm:text-left">
            Página <span className="font-semibold text-gray-900">{currentPage}</span> de <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              title="Anterior"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>

            {pages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`
                  w-8 h-8 rounded-md flex items-center justify-center 
                  text-xs font-medium transition-colors font-montserrat
                  ${page === '...' ? 'cursor-default text-gray-400' : 'hover:bg-gray-100 text-gray-700'}
                  ${currentPage === page ? 'bg-red-50 text-red-600 font-bold hover:bg-red-100' : ''}
                `}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              title="Siguiente"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;