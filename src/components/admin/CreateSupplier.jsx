import React, { useState } from "react";

const CreateSupplier = () => {

    const [supplierName, setSupplierName] = useState("");
    const [supplierCode, setSupplierCode] = useState("");
    const [supplierNit, setSupplierNit] = useState("");
    const [supplierAccountNumber, setSupplierAccountNumber] = useState("");

    const handleConfirm = (event) => {
        event.preventDefault();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'supplierName':
                setSupplierName(value);
                break;
            case 'supplierCode':
                setSupplierCode(value);
                break;
            case 'supplierNit':
                setSupplierNit(value);
                break;
            case 'supplierAccountNumber':
                setSupplierAccountNumber(value);
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md w-2/4 font-montserrat flex flex-col justify-between">

            <form onSubmit={handleConfirm} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-700">Registro de proveedores</h2>
                    <label htmlFor="supplierName" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                    <input
                        id="supplierName"
                        name="supplierName"
                        type="text"
                        className="w-full p-2 border border-red-300 rounded-md"
                        value={supplierName}
                        onChange={handleChange}
                        placeholder="FREUND"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="supplierCode" className="block text-gray-700 text-sm font-bold mb-2">Código</label>
                    <input
                        id="supplierCode"
                        name="supplierCode"
                        type="number"
                        className="w-full p-2 border border-red-300 rounded-md"
                        value={supplierCode}
                        onChange={handleChange}
                        placeholder="234567"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="supplierNit" className="block text-gray-700 text-sm font-bold mb-2">NIT</label>
                    <input
                        id="supplierNit"
                        name="supplierNit"
                        type="number"
                        className="w-full p-2 border border-red-300 rounded-md"
                        value={supplierNit}
                        onChange={handleChange}
                        placeholder="06142711011120"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="supplierCode" className="block text-gray-700 text-sm font-bold mb-2">Número de cuenta</label>
                    <input
                        id="supplierAccountNumber"
                        name="supplierAccountNumber"
                        type="number"
                        className="w-full p-2 border border-red-300 rounded-md"
                        value={supplierAccountNumber}
                        onChange={handleChange}
                        placeholder="4838234567"
                        required
                    />
                </div>
            </form>
            <div className="flex justify-end">
                <button
                    type="submit"
                    onClick={handleChange}
                    className="bg-red-600 rounded-md text-white p-4 text-center cursor-pointer font-bold hover:bg-red-700"
                >
                    Registrar
                </button>
            </div>
        </div>
    );
}

export default CreateSupplier