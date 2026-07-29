import React from "react";
import LinkUser from "../../components/admin/LinkUser";
import ViewUsers from "../../components/admin/ViewUsers";


const UserManagement = () => {
    return (
        <div className="bg-gray-100 min-h-screen w-full flex pt-28 p-6 gap-6">
            <LinkUser />
            <ViewUsers />
        </div>
    );
}

export default UserManagement;