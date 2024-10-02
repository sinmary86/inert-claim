import { useState } from 'react';
import './App.css';
import Claim from './Claim';
import WorkSheet from './WorkSheet';
import DownloadDocument from './DownloadDocument'; // Импортируем компонент для скачивания

function App() {

      const [buyerName, setBuyerName] = useState(""); 
      const [taxNum, setTaxNum] = useState("");
      const [buyerAddress, setBuyerAddress] = useState(""); 
      const [contractData, setContractData] = useState("");
      const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Формат YYYY-MM-DD
      });

      const [formType, setFormType] = useState("2020");
      const [term, setTerm] = useState("0");
      const [penaltyRate, setPenaltyRate] = useState("0,15%");
      const [increaseSumStatus, setIncreaseSumStatus] = useState("checked");
      const [totalDebt, setTotalDebt] = useState(0);
      const [totalPenaltySum, setTotalPenaltySum] = useState(0);
      const [documents, setDocuments] = useState([]);
      
      const handleDocumentChange = (newDocuments) => {
        setDocuments(newDocuments);
    };

    const handlePenaltyRateChange = (newRate) => {
      setPenaltyRate(newRate); // Обновляем значение неустойки
    };

    const [totalIncreaseSum, setTotalIncreaseSum] = useState(0); // Для хранения суммы 10%

    const handleTotalIncreaseSumChange = (sum) => {
        setTotalIncreaseSum(sum); // Обновляем состояние для суммы 10%
    };

    const handleTotalPenaltySumChange = (sum) => {
      setTotalPenaltySum(sum);
    };

    const claimProps = {
      buyerName,
      taxNum,
      buyerAddress,
      contractData,
      currentDate,
      formType,
      increaseSumStatus,
      term,
      totalDebt,
      documents,
      penaltyRate,
      totalIncreaseSum,
      totalPenaltySum,
  };

  return (<div className="App">
    
<div className='container-data'> 
      <WorkSheet 
            onBuyerChange={setBuyerName}
            onTaxNumberChange={setTaxNum}
            onAddressChange={setBuyerAddress}
            onContractChange={setContractData}
            onDateChange={setCurrentDate}
            onFormTypeChange={setFormType}
            onPaymentTermChange={setTerm}
            onPenaltyRateChange={handlePenaltyRateChange} 
            onIsIncreaseSumChange={setIncreaseSumStatus}
            onDocumentsChange={handleDocumentChange}
            onTotalDebtChange={setTotalDebt}
            onTotalIncreaseSumChange={handleTotalIncreaseSumChange}
            onTotalPenaltySumChange={handleTotalPenaltySumChange}
            />

                 <div className="download-button">
            <DownloadDocument claimProps={claimProps} />
            </div>
</div>

<div className='container-claim'>
      <Claim 
            buyerName={buyerName}
            taxNum={taxNum}
            buyerAddress={buyerAddress}
            contractData={contractData} 
            date={currentDate}
            formType={formType}
            term={term}
            penaltyRate={penaltyRate} // Передаем новое значение в Claim
            increaseSumStatus={increaseSumStatus}
            documents={documents}
            totalDebt={totalDebt}
            totalIncreaseSum={totalIncreaseSum} 
            totalPenaltySum={totalPenaltySum}
      />
</div>

    </div>
    );
}

export default App;