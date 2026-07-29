import React from 'react';

const CardDisbursementDate = ({ disbursementDate }) => {
    return (
        <div className="w-1/3 flex items-center justify-center gap-3  px-4 py-2 bg-white shadow-lg rounded-lg">
            <div className="flex flex-col justify-center">
                <span className="text-xs font-medium text-gray-500 text-center">Fecha de desembolso</span>
                <span className="text-sm font-semibold text-gray-700 text-center">
                    {disbursementDate ? disbursementDate.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) : 'N/A'}
                </span>
            </div>
        </div>
    );
}

export default CardDisbursementDate;