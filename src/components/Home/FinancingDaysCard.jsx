import React from 'react';
import Icon from '@mdi/react';
import { mdiCalendarToday } from '@mdi/js';

const FinancingDaysCard = () => {
    return (
        <div>
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4 shadow-sm mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                        <Icon
                            path={mdiCalendarToday}
                            size={1}
                            color="#dc2626"
                        />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Días de financiamiento</p>
                        <p className="text-md font-bold text-gray-800 text-center">60</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FinancingDaysCard;