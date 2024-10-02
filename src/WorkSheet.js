import { useState, useEffect } from "react";
import { formatDate, formatNumberWithSpaces } from './Utils';

const WorkSheet = ({ onBuyerChange, onAddressChange, onContractChange, onDateChange, onIsIncreaseSumChange, onPenaltyRateChange, onPaymentTermChange, onTotalDebtChange, onTotalIncreaseSumChange, onDocumentsChange, onTaxNumberChange, onTotalPenaltySumChange }) => {

    const [buyer, setBuyer] = useState(""); 
    const [taxNumber, setTaxNumber] = useState("");
    const [address, setAddress] = useState(""); 
    const [contract, setContract] = useState(""); 
    const [paymentTerm, setPaymentTerm] = useState("");
    const [penaltyRate, setPenaltyRate] = useState("0,15%");
    const [isIncreaseSum, setIsIncreaseSum] = useState(false);

    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Форматируем как 'YYYY-MM-DD'
    });

    const handleCurrentDate = (e) => {
        const newDate = e.target.value;
        setCurrentDate(newDate);
        onDateChange(newDate);
        recalculatePenaltySum();   // Пересчитываем все значения при изменении текущей даты
    };

    const [rows, setRows] = useState([{ id: Date.now(), sum: "", document: "", shipmentDate: "", penaltyDays: "", paymentDate: "", checked: false }]);
    
    const handleBuyerChange = (e) => {
        setBuyer(e.target.value);
        onBuyerChange(e.target.value);  // Передача значения в родительский компонент
    };

    const handleTaxNumberChange = (e) => {
        setTaxNumber(e.target.value);
        onTaxNumberChange(e.target.value);
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
        onAddressChange(e.target.value);  // Передача значения в родительский компонент
    };

    const handleContractChange = (e) => {
        setContract(e.target.value);
        onContractChange(e.target.value);  // Передача значения в родительский компонент
    };

    const handlePenaltyRateChange = (e) => {
        const newRate = e.target.value;
        setPenaltyRate(newRate); // Обновляем локальное состояние в WorkSheet
        onPenaltyRateChange(newRate); // Передаем новое значение в родительский компонент (App)
    };

     const handleIncreaseSum = () => {
         const statusIsIncreaseSum = !isIncreaseSum;
         setIsIncreaseSum(statusIsIncreaseSum);
         onIsIncreaseSumChange(statusIsIncreaseSum ? "checked" : "unchecked");
     };

     const addDaysToDate = (date, days) => {
         const result = new Date(date);
         result.setDate(result.getDate() + days); 
         return result.toISOString().split('T')[0];  // Преобразуем в формат YYYY-MM-DD
     };

    const handleShipmentDateChange = (index, value) => {
        const updatedRows = [...rows];
        updatedRows[index].shipmentDate = value;

        // Рассчитываем дату платежа, если введена дата отгрузки и срок оплаты
        if (updatedRows[index].shipmentDate && paymentTerm) {
            const paymentTermDays = parseInt(paymentTerm);
            updatedRows[index].paymentDate = addDaysToDate(value, paymentTermDays);
        }

        setRows(updatedRows);
        recalculatePenaltySum();
    };

    const handlePaymentTermChange = (e) => {
        setPaymentTerm(e.target.value);
        onPaymentTermChange(e.target.value);

        const updatedRows = [...rows];
        updatedRows.forEach((row, index) => {
            if (row.shipmentDate) {
                const paymentTermDays = parseInt(e.target.value);
                updatedRows[index].paymentDate = addDaysToDate(row.shipmentDate, paymentTermDays);
            }
        });
        setRows(updatedRows);
        recalculatePenaltySum();
    };
    
    const calculateDaysDifference = (paymentDate, currentDate) => {
        if (!paymentDate) return ""; // Если дата платежа не определена, возвращаем пустую строку
       
        const paymentDateObject = new Date(paymentDate); // Преобразуем строку даты платежа в объект даты
        const currentDateObject = new Date(currentDate); // Используем текущее значение даты, переданное как параметр
        
        // Проверяем корректность обеих дат
        if (isNaN(paymentDateObject.getTime())) {
            return ""; // Если дата платежа некорректна, возвращаем пустую строку
        }
    
        // Рассчитываем разницу в миллисекундах и переводим в дни
        const diffInMilliseconds = currentDateObject - paymentDateObject;
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)); // Округляем до целого числа
       
  
        return diffInDays < 0 ? 0 : diffInDays; // Если разница отрицательная (платеж в будущем), возвращаем 0
    };

    const calculatePenalty = (sum, days, penaltyRate) => {
        if (!sum || !days || !penaltyRate) return 0;
    
        // Проверяем, выбрана ли ставка по ст. 395 ГК РФ
        if (penaltyRate === 'ст.395ГК') {
            const centralBankRate = 19 / 100; // 19% ставка для расчета по ст. 395 ГК РФ
            return sum * centralBankRate / 365 * days; // Формула расчета по ст. 395 ГК РФ
        }
    
        // Преобразуем строку неустойки в число для стандартных процентных ставок
        const penaltyRateNumber = parseFloat(penaltyRate.replace('%', '').replace(',', '.')) / 100;
    
        // Стандартный расчет неустойки по выбранной процентной ставке
        return sum * days * penaltyRateNumber;
    };
    
    // Рассчитываем общую сумму неустойки
    const totalPenaltySum = rows.reduce((total, row) => {
        const days = calculateDaysDifference(row.paymentDate, currentDate); // Рассчитываем количество дней
        const penalty = calculatePenalty(row.sum, days, penaltyRate); // Рассчитываем неустойку для строки
        return total + penalty;
    }, 0);

    const handleSumChange = (index, value) => {
        const updatedRows = [...rows];
    
       // Обновляем значение строки напрямую без преобразования
    updatedRows[index].sum = value; 
    setRows(updatedRows);
    recalculatePenaltySum();
    };

    // Функция для форматирования и преобразования при потере фокуса
    const formatInputOnBlur = (index, value) => {
    const updatedRows = [...rows];

    // Заменяем запятую на точку и удаляем пробелы
    const cleanedValue = value.replace(/\s/g, '').replace(',', '.');

    // Преобразуем в число
    const parsedValue = parseFloat(cleanedValue);

    // Обновляем значение строки, если это корректное число
    if (!isNaN(parsedValue)) {
        updatedRows[index].sum = parsedValue.toFixed(2); // Форматируем с двумя знаками после запятой
    }

    setRows(updatedRows);

    // Пересчитываем общую сумму
    const totalSum = updatedRows.reduce((acc, row) => acc + (parseFloat(row.sum) || 0), 0);
    onTotalDebtChange(totalSum);
};

    const recalculatePenaltySum = () => {
        const totalPenaltySum = rows.reduce((total, row) => {
            const days = calculateDaysDifference(row.paymentDate, currentDate); // Рассчитываем количество дней
            const penalty = calculatePenalty(row.sum, days, penaltyRate); // Рассчитываем неустойку для строки
            
            return total + penalty;
        }, 0);
        onTotalPenaltySumChange(totalPenaltySum); // Обновляем общую сумму неустойки в родительском компоненте
    };
    

    const handleDocumentChange = (index, value) => {
        const updatedRows = rows.map((row, i) => 
            i === index ? { ...row, document: value } : row
        );
        updateRows(updatedRows);
    };
 
    const updateRows = (updatedRows) => {
        setRows(updatedRows);
        const allDocuments = updatedRows.map(row => ({ document: row.document, checked: row.checked }));
        onDocumentsChange(allDocuments);  // Передаем все документы в App
        const totalSum = updatedRows.reduce((acc, row) => acc + row.sum, 0);
        onTotalDebtChange(totalSum);
        recalculatePenaltySum();
    };

    const addRow = () => {
        setRows([...rows, { id: Date.now(), sum: 0, document: "", shipmentDate: "", penaltyDays: "", checked: false }]);
        recalculatePenaltySum();
    };

    const removeRow = (id) => {
        const updatedRows = rows.filter(row => row.id !== id);
        updateRows(updatedRows);
    };

    const totalIncreaseSum = rows.reduce((acc, row) => {
        if (isIncreaseSum) {  
            return acc + (row.sum / 10);
        }
        return acc;
    }, 0);

    // Передача суммы в родительский компонент
    useEffect(() => {
        onTotalIncreaseSumChange(totalIncreaseSum);
    }, [totalIncreaseSum, onTotalIncreaseSumChange]);

     useEffect(() => {
         const totalPenaltySum = rows.reduce((acc, row) => {
             const days = calculateDaysDifference(row.paymentDate, currentDate);
             const penaltyForRow = calculatePenalty(row.sum, days, penaltyRate);
         return acc + penaltyForRow;
         }, 0);
         onTotalPenaltySumChange(totalPenaltySum);  // Передаем рассчитанное значение в App
     }, [rows, penaltyRate, currentDate, onTotalPenaltySumChange]);

    
    return(<div className="data">

        <div className='line'>
           <h3>Покупатель:</h3>
           <input 
           type="text" 
           placeholder="форма и наименование"
           value={buyer}
           onChange={handleBuyerChange}
           />
           <h3>ИНН:</h3>
           <input 
           type="text" 
           placeholder="ИНН Покупателя"
           value={taxNumber}
           onChange={handleTaxNumberChange}
           />
        </div> 

        <div className='line'>
           <h3>Адрес:</h3>
           <input 
           type="text" 
           placeholder="адрес Покупателя"
           value={address}
           onChange={handleAddressChange}
           />
        </div> 

        <div className='line'>
           <h3>Договор: </h3>
           <input 
           type="text"
           placeholder="номер и дата договора"
           value={contract}
           onChange={handleContractChange}/>
         </div>


<div className='line'>
           <h3>Срок оплаты: </h3>
           <label>
            <input
                className="inputDays"
                type="text"
                value={paymentTerm}
                onChange={handlePaymentTermChange} />
           </label>
           </div>

           <div className="straf-container line">
           <h3>Неустойка: </h3>
                <div className="peni-options">
                    <select className="peni-select" value={penaltyRate} onChange={handlePenaltyRateChange}>
                        <option value="0.15%">0,15%</option>
                        <option value="0.10%">0,10%</option>
                        <option value="ст.395ГК">ст.395ГК</option>
                    </select>
                </div>
            
                <h3>Увеличение стоимости: </h3>
                <div>
                <input 
                    type="checkbox" 
                    className="straf-select" 
                    checked={isIncreaseSum} 
                    onChange={handleIncreaseSum}
                    />
                </div>
           </div>

            <div className="line">
            <h3>Расчет произвести по состоянию на: </h3>
            <input 
            type="date" 
            value={currentDate}
            onChange={handleCurrentDate} />
            </div> 

           <h4>ОТГРУЗКИ: </h4>
                <table>
                    <thead>
                        <tr>
                            <th>Дата отгрузки</th>
                            <th>УПД</th>
                            <th>Сумма</th>
                            <th>Дата платежа</th>
                            <th>Просрочка</th>
                            <th>Сумма неустойки</th>
                            <th className={isIncreaseSum ? "thClass" : "block"}>Сумма 10%</th>
                            <th>-/+</th>
                        </tr>
                    </thead>

                    <tbody>
                    {rows.map((row, index) => {
    const days = calculateDaysDifference(row.paymentDate, currentDate); // Рассчитываем разницу в днях

    // Рассчитываем неустойку для строки
    const penalty = calculatePenalty(row.sum, days, penaltyRate);

                       
                        return (
                            <tr key={row.id}>

                            <td><input 
                            type="date" 
                            value={row.shipmentDate}
                            onChange={(e) => handleShipmentDateChange(index, e.target.value)}
                            /></td>

                            <td>
                            <input
                                    className="calculateInput"
                                    type="text"
                                    value={row.document}  // Значение для УПД/Акт
                                    onChange={(e) => handleDocumentChange(index, e.target.value)}  // Обработчик изменения
                                />
                                </td>
                            
                            <td>
                            <input
                                className="sumInput"
                                type="text"
                                value={row.sum} // Оставляем текущее значение для ввода пользователем
                                onChange={(e) => handleSumChange(index, e.target.value)} // Обработка изменений во время ввода
                                onBlur={(e) => formatInputOnBlur(index, e.target.value)} // Форматирование при потере фокуса
                            />
                            </td>
                            
                            <td className="dateDuty">{row.paymentDate ? formatDate(row.paymentDate) : ""}</td>
                            <td className="daysPenalty">{days}</td>
                            <td className="sumPenalty">{penalty.toFixed(2)}</td>
                            <td className={isIncreaseSum ? "tdClass" : "block"}>
                                {isIncreaseSum ? (row.sum / 10).toFixed(2) : '0'}
                            </td>

                            <td>
                                <button className="delete-row-button" onClick={() => removeRow(row.id)}>x</button>
                            </td>
                        </tr>
                    );
                })}
                    </tbody>
                </table>
                <button onClick={addRow} className="add-row-button">Добавить отгрузку</button>
        
           
            <div>
            <h4>Сумма долга: {formatNumberWithSpaces(
    rows.reduce((sum, row) => sum + (parseFloat(row.sum.toString().replace(',', '.')) || 0), 0)
)} p.</h4>
                <h4>Сумма неустойки: {formatNumberWithSpaces(totalPenaltySum.toFixed(2))} p.</h4>
                <h4 className={isIncreaseSum ? "line" : "block"}>Сумма 10%: {formatNumberWithSpaces(totalIncreaseSum)} p.</h4>
            </div>
        
    </div>
    )
}

export default WorkSheet;