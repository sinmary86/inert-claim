export const formatDate = (date) => {

    console.log("Formatting Date:", date); // Добавьте эту строку для отладки
    if (!date) return "";  // Проверка на наличие даты

    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return formattedDate;
};

export const formatNumberWithSpaces = (number) => {
    const formattedNumber = parseFloat(number).toFixed(2); // Округляем до двух знаков после запятой
    return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Добавляем пробелы
};