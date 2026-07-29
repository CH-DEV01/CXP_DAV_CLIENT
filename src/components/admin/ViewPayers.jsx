import React, { useState, useEffect } from "react";
import { payerService } from '../../services/admin/payerService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ViewPayers = () => {

    const [payers, setPayers] = useState([]);

    useEffect(() => {
        const fetchPayers = async () => {
            try {
                const response = await payerService.getEntities();
                if (response.status === 200) {
                    setPayers(response.data);
                } else {
                    console.error('Error fetching payers:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching payers:', error);
            }
        };
        fetchPayers();
    }, []);

    return (
        <div className="w-3/4"> 
            {payers.length > 0 ? (
                <div className="bg-white shadow-sm rounded-2xl p-6 h-full border-2 border-gray-200">
                    <div className="overflow-x-auto w-full">
                        <table className="table-fixed w-full leading-normal">
                            <thead>
                                <tr className="bg-white rounded-lg text-gray-700 uppercase text-sm">
                                    <th className="py-3 px-6 text-left">Código</th>
                                    <th className="py-3 px-6 text-left">Razón social</th>
                                    <th className="py-3 px-6 text-left">E-mail</th>
                                    <th className="py-3 px-6 text-left">NIT</th>
                                    <th className="py-3 px-6 text-left">Cuenta bancaria</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payers.map((payer, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 hover:bg-indigo-50 transition duration-300 ease-in-out"
                                    >
                                        <td className="py-3 px-6 text-left whitespace-no-wrap">
                                            {payer.code}
                                        </td>
                                        <td className="py-3 px-6 text-left brake-words">
                                            {payer.name}
                                        </td>
                                        <td className="py-3 px-6 text-left break-words">
                                            {payer.email}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {payer.nit}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                {payer.accountBank}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <LoadingSpinner></LoadingSpinner>
            )}
        </div>
    );
};

export default ViewPayers;