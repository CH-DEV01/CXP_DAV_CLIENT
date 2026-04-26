const getISOWeekOfMonth = (date) => {
    const fecha = new Date(date);
    const dia = fecha.getDate();

    const semana = Math.min(Math.ceil(dia / 7), 4); 

    return semana;
};
export default getISOWeekOfMonth;