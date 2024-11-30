import React, { useState, useRef, useEffect } from 'react';
import './Cheque.css';

const Cheque = () => {
  const [amountLines, setAmountLines] = useState(['', '', '']);
  const inputRefs = useRef([]);

  const handleAmountLineChange = (index, value) => {
    const newAmountLines = [...amountLines];
    newAmountLines[index] = value;
    setAmountLines(newAmountLines);

    // Auto focus to next input if current input is at max length
    if (value.length === 35 && index < amountLines.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-GB').split('/').flatMap(d => 
      d.padStart(2, '0').split('').map(digit => digit)
    );
  };

  return (
    <div className="cheque">
      <div className="cheque-header">
        <div className="bank-name">
          Sample Bank Ltd.
        </div>
        <div className="date-section">
          <span className="date-label">Date:</span>
          {getCurrentDate().map((digit, index) => (
            <div key={index} className="date-box">{digit}</div>
          ))}
        </div>
      </div>

      <div className="amount-section">
        <div className="amount-in-words">
          {amountLines.map((line, index) => (
            <div key={index} className="amount-line">
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                className="amount-text"
                value={line}
                maxLength={35}
                onChange={(e) => handleAmountLineChange(index, e.target.value)}
                placeholder={index === 0 ? 'Fifty' : 
                             index === 1 ? 'Thousand Eight Hundred' : 
                             'and Ninety-Two Rupees Only'}
              />
            </div>
          ))}
        </div>
        <div className="amount-box-container">
          <div className="amount-box">50,892.00</div>
        </div>
      </div>

      <div className="micr">
        <span className="micr-segment">■ 123456</span>
        <span className="micr-segment">0987</span>
        <span className="micr-segment">654</span>
        <span className="micr-segment">1234567890 ■</span>
      </div>
    </div>
  );
};

export default Cheque;