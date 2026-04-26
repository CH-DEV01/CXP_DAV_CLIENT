import React from 'react';

const FinancingSummaryCard = ({
        totalAmount, 
        commission, 
        interests, 
        amountToBePaid}) => {
    return (
        <div className="mt-2">
            <div className="bg-white p-6 rounded-lg shadow-lg">

                <div className="flex items-center justify-between w-full mb-4">
                   
                    <h2 className="text-md font-bold mb-4 text-gray-800 w-full">Monto total a financiar</h2>
                
                    <h2 className="text-sm mb-4 text-gray-800 w-full text-end">$ {totalAmount}</h2>
           
                </div>

                <div className="border-t border-b border-gray-200 py-3">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-700">Comisión (con IVA)</span>
                        <span className="font-semibold">$ {commission}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-700">Intereses</span>
                        <span className="font-semibold">$ {interests} </span>
                    </div>
                </div>

                <div className="flex justify-between py-3 mt-2 bg-gray-50 px-3 rounded">
                    <span className="text-gray-800 font-bold text-md">A abonar</span>
                    <span className="text-red-600 font-bold">$ {amountToBePaid}</span>
                </div>
            </div>
        </div>
    );
}

export default FinancingSummaryCard;