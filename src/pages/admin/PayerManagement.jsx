import React from "react";
import CreatePayer from "../../components/admin/CreatePayer";
import ViewPayers from "../../components/admin/ViewPayers";


const PayerManagement = () => {
    return (
        <div className="bg-gray-100 min-h-screen w-full flex pt-28 p-6 gap-6">
            <CreatePayer />
            <ViewPayers />
        </div>
    );
}

export default PayerManagement;