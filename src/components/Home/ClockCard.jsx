import React from 'react';
import { mdiClockOutline } from '@mdi/js';
import Icon from '@mdi/react';

const ClockCard = ({formattedDate}) => {

    return (
        <div className="flex items-center gap-3  px-4 py-2 border border-gray-300 rounded-lg bg-white  focus:outline-none">
            <div className="p-2 bg-red-100 rounded-full">
                <Icon
                    path={mdiClockOutline}
                    size={1}
                    color="#dc2626"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500">Fecha actual</span>
                <span className="text-sm font-semibold text-gray-700">
                    {formattedDate}
                </span>
            </div>
        </div>
    );
}

export default ClockCard;