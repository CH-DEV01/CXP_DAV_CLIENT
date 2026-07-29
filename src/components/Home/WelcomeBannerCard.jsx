import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const WelcomeBannerCard = () => {

    const [name, setName] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const { userData } = useAuth();

    useEffect(() => {

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (userData) {
            setName(userData.name);
        }
    }, [userData]);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date) => {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-ES', options);
    };

    return (
        <div className="p-3 bg-white rounded-lg border-l-2 border-red-500 shadow-md font-montserrat w-2/3">
            <div className="grid gap-6 md:grid-cols-8 items-center">
                <div className="md:col-span-6 md:border-gray-200">
                    <h1 className="text-sm font-bold text-gray-900 mb-1">
                        Bienvenido/a, <span className="text-red-600 font-bold">{name}</span>
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-red-300 rounded-full mb-2" />
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-medium text-gray-500">{formatDate(currentTime)}</p>
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-4 md:pl-4">
                    <div className="w-px h-10 bg-gray-200 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-md font-semibold text-gray-800 tracking-tight">
                            {formatTime(currentTime)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );

}

export default WelcomeBannerCard;