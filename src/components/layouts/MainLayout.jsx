import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const MainLayout = () => {
    return (
        <div>
            <Navbar />
            <main className="bg-gray-100 pt-20 p-4">
                <Outlet/>
            </main>
        </div>
    );
}

export default MainLayout;