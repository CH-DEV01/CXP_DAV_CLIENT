import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertOutline } from '@mdi/js';

const Disclaimer = () => {
  return (
    <div
      className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 rounded-lg shadow-sm"
      role="alert"
    >
      <div className="flex items-start">
        <Icon
          path={mdiAlertOutline}
          size={1.5}
          className="text-red-600 flex-shrink-0 mr-3"
        />
        <div>
          <p className="font-semibold">Aviso importante</p>
          <p className="mt-1 text-sm">
            El desembolso de los documentos aprobados se efectuará en un día hábil (T+1) contado a partir de la fecha de selección que su proveedor decida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
