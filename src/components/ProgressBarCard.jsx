import React from 'react';
import PropTypes from 'prop-types';

/**
 * Un componente de tarjeta que muestra una barra de progreso con colores
 * dinámicos (verde, amarillo, rojo) según el rango.
 * @param {object} props
 * @param {number} props.progress - El porcentaje de progreso (0-100).
 */
const ProgressBarCard = ({ progress = 0 }) => {
  // Aseguramos que el progreso esté siempre entre 0 y 100
  const validProgress = Math.max(0, Math.min(100, progress));
  
  const isComplete = validProgress === 100;

  // --- Lógica de Color Dinámica ---
  let barGradient = '';
  let textColor = '';
  let statusMessage = '';
  
  // Detenemos la animación de pulso solo al llegar al 100%
  const barAnimation = isComplete ? '' : 'animate-pulse';

  if (validProgress < 50) {
    // Rango Normal: 0% - 49% (Verde)
    barGradient = 'bg-gradient-to-r from-green-400 to-emerald-500';
    textColor = 'text-green-600';
    statusMessage = 'Nivel óptimo';
  } else if (validProgress < 80) {
    // Rango de Advertencia: 50% - 89% (Amarillo)
    barGradient = 'bg-gradient-to-r from-yellow-400 to-amber-500';
    textColor = 'text-amber-600';
    statusMessage = '¡Advertencia: Nivel alto!';
  } else if (validProgress < 100) {
    // Rango de Peligro: 90% - 99% (Rojo)
    barGradient = 'bg-gradient-to-r from-red-500 to-rose-600';
    textColor = 'text-red-600';
    statusMessage = '¡Advertencia: Nivel alto!';
  } else {
    // Límite Alcanzado: 100% (Rojo Intenso)
    barGradient = 'bg-gradient-to-r from-red-600 to-red-700';
    textColor = 'text-red-700';
    statusMessage = '¡Límite alcanzado!';
  }
  // --- Fin de la Lógica de Color ---

  return (
    <div className="w-full max-w-md bg-white rounded-md shadow-xl p-6 mt-4">
      
      {/* Sección del Título y Porcentaje */}
      <div className="flex justify-between items-baseline mb-3">
        <span className="font-bold font-montserrat text-sm text-gray-700">
          Monto transaccional
        </span>
        <span className={`font-montserrat text-2xl font-bold ${textColor}`}>
          {validProgress}%
        </span>
      </div>

      {/* Pista de la Barra de Progreso */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        
        {/* Relleno de la Barra de Progreso */}
        <div
          className={`
            h-4 rounded-full 
            ${barGradient} 
            ${barAnimation} 
            transition-all duration-700 ease-out
          `}
          style={{ width: `${validProgress}%` }}
        ></div>
      </div>

      {/* Mensaje de Estado Opcional */}
      <div className="font-montserrat text-right text-xs text-gray-500 mt-2 font-medium">
        {statusMessage}
      </div>
    </div>
  );
};

ProgressBarCard.propTypes = {
  /** El porcentaje de progreso (0-100) */
  progress: PropTypes.number,
};

export default ProgressBarCard;