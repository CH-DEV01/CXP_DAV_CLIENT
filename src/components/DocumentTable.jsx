import React, { useEffect } from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { FaCog, FaSearch,  FaBuilding, FaFile, FaTimes  } from 'react-icons/fa';

const Table = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="sm:rounded-lg ring-opacity-5 overflow-hidden border-t-1 border-gray-200 shadow-lg">
      <div className="h-[400px] overflow-auto bg-white">
        <table className="min-w-full w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-600 font-semibold  bg-gray-200 
                            hidden md:table-header-group sticky top-0 z-10 font-montserrat">
            <tr>
              {columns.map((col) => (
                <th key={col.accessor} scope="col" className="px-6 py-4">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="px-6 py-4 text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {(!data || data.length === 0) && (
              <tr>
                <td 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} 
                  className="text-center text-gray-500 py-10"
                >
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
            
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={`
                  text-xs
                  font-montserrat
                  block md:table-row mb-4 md:mb-0
                  hover:bg-red-50 transition-colors duration-200
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    data-label={col.header}
                    className="px-6 py-5 block md:table-cell text-right md:text-left 
                                 border-b md:border-none 
                                 text-gray-900 whitespace-nowrap
                                 before:content-[attr(data-label)] md:before:content-none 
                                 before:font-bold before:uppercase before:text-xs before:text-gray-500 
                                 before:float-left md:before:float-none"
                  >
                    {/* <span className="md:float-none">{item[col.accessor]}</span> */}
                    <span className="md:float-none">
                      {/* Lógica para renderizar el chip o el valor por defecto */}
                      {col.render 
                        ? col.render(item[col.accessor], item)
                        : item[col.accessor]
                      }
                    </span>
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td
                    className="px-6 py-5 block md:table-cell text-center border-b md:border-none
                               md:space-x-2"
                  >
                    <span className="font-bold uppercase text-xs text-gray-500 float-left md:hidden">
                      Acciones
                    </span>
                    
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 
                                   ml-4 md:ml-0 transition-colors"
                        title="Ver documentos"
                      >
                        <FaFile />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-end items-center p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  w-8 h-8 rounded 
                  flex items-center justify-center 
                  text-sm font-medium transition-colors
                  ${currentPage === page
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {page}
              </button>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Table;