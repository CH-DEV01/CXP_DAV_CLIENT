import { useState, useEffect, useLayoutEffect, useCallback } from 'react';

// Claves internas para marcar nuestros propios estados de historial.
// No colisionan con las propiedades de React Router (usr, key, idx).
const FCP_FLOOR  = '__fcp_floor__';   // Marca la entrada raíz de la SPA en el historial
const FCP_BUFFER = '__fcp_buffer__';  // Marca el buffer que agregamos encima del piso

/**
 * Hook que intercepta la navegación hacia atrás en el navegador.
 *
 * Estrategia:
 *  1. useLayoutEffect corre ANTES que el useEffect de <Navigate> (DynamicRedirect).
 *     - replaceState: marca la entrada actual (raíz de SPA) como "piso".
 *     - pushState: agrega un buffer encima.
 *  2. DynamicRedirect (<Navigate replace />) reemplaza el buffer con /admin;
 *     el piso queda intacto en el historial.
 *  3. useEffect agrega el listener de popstate.
 *     - Solo muestra el modal cuando event.state tiene FCP_FLOOR (el usuario
 *       llegó al fondo real del historial SPA, a punto de salir hacia apps.html).
 *     - Navegación interna de React Router (estados sin FCP_FLOOR) no dispara el modal.
 */
export const useBackNavigation = () => {
  const [showModal, setShowModal] = useState(false);

  // useLayoutEffect: garantiza que replaceState/pushState ocurran
  // ANTES del useEffect de <Navigate replace /> de React Router.
  useLayoutEffect(() => {
    // Marcar la entrada ACTUAL como "piso" preservando el estado de React Router.
    const existingState = window.history.state || {};
    window.history.replaceState(
      { ...existingState, [FCP_FLOOR]: true },
      ''
    );

    // Agregar un buffer encima del piso.
    // DynamicRedirect lo reemplazará con /admin vía replaceState,
    // pero el piso (entrada anterior) queda protegido.
    window.history.pushState(
      { [FCP_BUFFER]: true },
      '',
      window.location.href
    );
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      // Solo actuar cuando el usuario llega exactamente al estado "piso":
      // significa que ha navegado atrás más allá de todas las rutas SPA
      // y el siguiente click lo llevaría a apps.html (fuera de nuestra app).
      if (event.state?.[FCP_FLOOR]) {
        // Volver a poner el buffer para que el siguiente click atrás
        // aterrice aquí de nuevo y no salte a apps.html.
        window.history.pushState(
          { [FCP_BUFFER]: true },
          '',
          window.location.href
        );
        setShowModal(true);
      }
      // Estados de React Router o nuestro buffer: dejar que React Router los maneje.
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowModal(false);
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'https://devpay.davivienda.com.sv';
  }, []);

  const handleCancel = useCallback(() => {
    setShowModal(false);
  }, []);

  return { showModal, handleConfirm, handleCancel };
};
