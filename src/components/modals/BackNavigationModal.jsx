import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

/**
 * Modal de confirmación para navegación hacia atrás.
 * Pregunta al usuario si desea cerrar la sesión al intentar salir de la aplicación.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Indica si el modal debe estar visible
 * @param {Function} props.onConfirm - Callback cuando el usuario acepta cerrar sesión
 * @param {Function} props.onCancel - Callback cuando el usuario cancela la acción
 */
const BackNavigationModal = ({ isOpen, onConfirm, onCancel }) => {
  useEffect(() => {
    if (isOpen) {
      Swal.fire({
        title: '¿Cerrar sesión?',
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p><strong>¿Está seguro que desea cerrar sesión en el sitio Financiamiento Cuentas Por Pagar?</strong></p>
            <p style="color: #666; margin-top: 12px;">
              Será redirigido al portal principal de Davivienda.
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'No, cancelar',
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#757575',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          // Opcional: enfocar en el botón de cancelar por defecto
          Swal.getConfirmButton().focus();
        }
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
        } else {
          onCancel();
        }
      });
    }
  }, [isOpen, onConfirm, onCancel]);

  return null;
};

export default BackNavigationModal;
