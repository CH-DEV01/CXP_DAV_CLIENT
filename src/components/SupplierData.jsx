import React from "react";
import { useEffect } from "react";

const IconIdCard = () => (
  <svg
    className="h-6 w-6 text-red-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
    />
  </svg>
);

const IconEmail = () => (
  <svg
    className="h-6 w-6 text-red-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

// --- Nuevo Icono: Código de Identificación ---
const IconIdentificationCode = () => (
<svg
    className="h-6 w-6 text-red-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5v15m7.5-15v15M3.75 9.75h16.5m-16.5 4.5h16.5"
    />
  </svg>
);

// --- Nuevo Icono: Número NIT (similar a una tarjeta de identificación/documento) ---
const IconNit = () => (
    <svg
        className="h-6 w-6 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 9h-15m15 0a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V11.25A2.25 2.25 0 014.5 9m15 0V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v2.25m15 0M9 12.75V15m3-2.25v2.25m3-2.25v2.25"
        />
    </svg>
);

// --- Componente DataItem (Sin cambios) ---
// --- Componente DataItem (MODIFICADO PARA MANEJAR TEXTO LARGO) ---
const DataItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start justify-start w-full">
      <div className="mt-2 flex-shrink-0">{icon}</div> {/* Icono (añadido flex-shrink-0 por seguridad) */}
      
      {/* Añadimos min-w-0 aquí.
        Esto le dice al contenedor de texto que puede encogerse más allá 
        del ancho de su contenido, permitiendo que 'break-words' funcione 
        correctamente dentro de un contenedor flex.
      */}
      <div className="ml-3 text-left min-w-0"> 
        <p className="text-sm font-medium text-gray-500 ">{label}</p>
        <p className="text-xs font-semibold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
};

// --- Componente SupplierData (AJUSTADO PARA RESPONSIVE) ---
const SupplierData = ({nit, bankAccount, email, code, entityName}) => {

  return (
    <div className="bg-white rounded-lg shadow-lg font-montserrat max-w-lg mx-auto p-6">
      
      {/* --- Cabecera (Sin cambios) --- */}
      <div className="pb-4 border-b border-gray-200 text-center">
        <h2 className="font-montserrat text-sm font-bold text-gray-900">
            {entityName}
        </h2>
      </div>

      {/* --- Contenedor de datos (AHORA RESPONSIVE CON GRID) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 pt-6">
        
        {/* Los DataItem ahora son hijos directos del grid */}
        <DataItem
          icon={<IconNit />}
          label="NIT"
          value={nit}
        />
        
        <DataItem
          icon={<IconIdCard />}
          label="Número de cuenta bancaria"
          value={bankAccount}
        />
        
        <DataItem
            icon={<IconEmail />}
            label="Correo Electrónico"
            value={email}
        />
        
        <DataItem
          icon={<IconIdentificationCode />}
          label="Código de identificación"
          value={code}
        />
      
      </div>
    </div>
  );
};

export default SupplierData;