import getISOWeekOfMonth from "./getISOWeekOfMonth";

const getAvailableWeeks = (accountsPayable) => {
    const weeksMap = new Map();

    accountsPayable.forEach(item => {
        const fecha = new Date(item.issueDate);
        const semana = getISOWeekOfMonth(fecha);
        const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
        const año = fecha.getFullYear();
        const clave = `Semana ${semana} - ${mes} ${año}`;

        if (semana >= 1 && semana <= 4) {
            weeksMap.set(clave, {
                fechaInicio: new Date(fecha.getFullYear(), fecha.getMonth(), (semana - 1) * 7 + 1),
                fechaFin: new Date(fecha.getFullYear(), fecha.getMonth(), Math.min(semana * 7, new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()))
            });
        }
    });

    return Array.from(weeksMap.entries()).sort((a, b) => a[1].fechaInicio - b[1].fechaInicio);
};

export default getAvailableWeeks;