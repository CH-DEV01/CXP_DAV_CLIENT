import React, { useEffect } from 'react';
import formatNumber from '../../utils/formatNumber'; 

const ItemsSelectedCard = ({ accountsPayable }) => {

    function formatISODate(isoString) {
        const date = new Date(isoString);
        if (isNaN(date)) {
            return 'Fecha inválida';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <div className="flex flex-col h-[450px] bg-white rounded-lg shadow-md overflow-hidden">
            {accountsPayable && accountsPayable.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de emisión</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de vencimiento</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días de financiamiento</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto de la factura</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intereses</th>
                                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {accountsPayable.map(item => (
                              <tr key={item.documentNumber} className="hover:bg-gray-50 transition-colors">
                                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatISODate(item.issueDate)}
                                    </td>
                                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatISODate(item.cutOffDate)}
                                    </td>
                                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.financingDays}
                                    </td>
                                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        $ {formatNumber(item.amount)}
                                    </td>
                                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        $ {formatNumber(item.interests || 0)}
                                    </td>
                                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        $ {formatNumber(item.commissions)}
                                    </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center px-4">No ha seleccionado ninguna factura para financiar.</p>
                </div>
            )}
        </div>
    );
}

export default ItemsSelectedCard;