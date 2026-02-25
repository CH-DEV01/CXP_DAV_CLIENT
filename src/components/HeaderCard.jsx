import React from 'react';
import { FaPlus } from 'react-icons/fa';

/**
 * Un componente de cabecera estilizado como una tarjeta.
 *
 * @param {string} title - El texto del título principal.
 * @param {string} description - El texto del subtítulo.
 * @param {React.Component} icon - El icono principal a mostrar (ej: <FaUsers />).
 * @param {string} buttonText - El texto para el botón de acción.
 * @param {Function} onButtonClick - La función que se ejecutará al hacer clic en el botón.
 */
const HeaderCard = ({ title, buttonText, onButtonClick, description, icon }) => {
  return (
    <div className="                             
      p-4
      pr-0                                           
      flex flex-col md:flex-row 
      justify-between           
      items-center              
      border-l-2 border-red-600 
    ">
      
      <div className="flex items-center mb-4 md:mb-0">
      
        {icon && (
          <div className="bg-red-100 p-2 rounded-full mr-3">
            {React.cloneElement(icon, { className: "text-red-600 text-xl" })}
          </div>
        )}
        
        <div>
          <h1 className="
            text-xs
            uppercase                  
            text-gray-600
            font-semibold           
            font-montserrat
            mb-1
          ">
            {title}
          </h1>
          <h4 className="
            font-montserrat
            text-xs                   
            text-gray-400             
          ">
            {description}
          </h4>
        </div>
      </div>

      <button
        onClick={onButtonClick}
        className="
          font-montserrat
          flex items-center           
          bg-red-600 hover:bg-red-700
          text-white 
          py-2 px-3                
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
          Registrar {buttonText}
        </span> 
      </button>
    </div>
  );
};

export default HeaderCard;