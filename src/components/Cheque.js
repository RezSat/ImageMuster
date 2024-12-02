import React, { useState, useRef, useEffect } from 'react';
import './Cheque.css';


// Bank data with names and MICR codes
const BANK_DATA = [
  {
    name: "Hatton National Bank",
    code: "7083",
    branch: "001"
  },
  {
    name: "People's Bank",
    code: "0240",
    branch: "005"
  },
  {
    name: "Bank of Ceylon",
    code: "0229",
    branch: "660"
  },
  {
    name: "Commercial Bank",
    code: "0024",
    branch: "003"
  },
  {
    name: "Sampath Bank",
    code: "0153",
    branch: "006"
  }
];

// Function to get random bank
const getRandomBank = () => {
  const randomIndex = Math.floor(Math.random() * BANK_DATA.length);
  return BANK_DATA[randomIndex];
};

// Function to generate random account number
const generateAccountNumber = () => {
  // Generate 10-digit account number
  return Array.from({length: 10}, () => 
    Math.floor(Math.random() * 10)
  ).join('');
};


// Function to convert number to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertHundreds = (n) => {
    if (n === 0) return '';
    if (n <= 9) return ones[n];
    if (n <= 19) return teens[n - 10];
    if (n <= 99) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertHundreds(n % 100) : '');
  };

  const convertThousands = (n) => {
    if (n === 0) return '';
    if (n <= 999) return convertHundreds(n);
    if (n <= 99999) {
      return convertHundreds(Math.floor(n / 1000)) + ' Thousand' + 
             (n % 1000 !== 0 ? ' ' + convertHundreds(n % 1000) : '');
    }
    return convertHundreds(Math.floor(n / 100000)) + ' Lakh' + 
           (n % 100000 !== 0 ? ' ' + convertThousands(n % 100000) : '');
  };

  return convertThousands(num);
};

// Function to generate cheque amount
const generateChequeAmount = () => {
  // Probability distribution for amount ranges
  const randomValue = Math.random();
  let amount;

  if (randomValue < 0.5) {
    // Thousands range (50% probability)
    amount = Math.floor(Math.random() * 9000) + 1000; // 1,000 to 9,999
  } else if (randomValue < 0.8) {
    // Hundreds range (30% probability)
    amount = Math.floor(Math.random() * 900) + 100; // 100 to 999
  } else {
    // Tens of thousands range (20% probability)
    amount = Math.floor(Math.random() * 90000) + 10000; // 10,000 to 99,999
  }

  // Decide whether to add cents (30% probability)
  const includeCents = Math.random() < 0.3;
  const cents = includeCents ? Math.floor(Math.random() * 100) : 0;

  // Format numeric amount with comma separators
  const formattedNumericAmount = amount.toLocaleString('en-IN') + 
    (cents > 0 
      ? `/${cents.toString().padStart(2, '0')}` 
      : '/-');

  // Calculate realAmount using period
  const realAmount = parseFloat(amount.toLocaleString('en-IN').replace(/,/g, '') + 
    (cents > 0 
      ? `.${cents.toString().padStart(2, '0')}` 
      : '.00'));

  return {
    numericAmount: formattedNumericAmount,
    realAmount: realAmount,
    wordAmount: numberToWords(amount) + 
                (cents > 0 ? ` and ${numberToWords(cents)} Cents` : '') + 
                ' Only'
  };
};

// Function to generate random six-digit cheque number
const generateChequeNumber = () => {
  return Array.from({length: 6}, () => 
    Math.floor(Math.random() * 10)
  ).join('');
};

const getCurrentDate = () => {
  // Get current date
  const currentDate = new Date();
  
  // Generate a random date within the last 90 days
  const randomDaysAgo = Math.floor(Math.random() * 90); // 0 to 89 days
  const pastDate = new Date(currentDate);
  pastDate.setDate(currentDate.getDate() - randomDaysAgo);

  // Format the date in DD/MM/YYYY and split into individual digits
  return pastDate.toLocaleDateString('en-GB').split('/').flatMap(d => 
    d.padStart(2, '0').split('').map(digit => digit)
  );
}

export const generateChequeBatch = (customParams = {}) => {
  const {
    //batchSize = Math.floor(Math.random() * (200 - 30 + 1)) + 30, // Random number between 30 and 200
    //batchSize = 2,
    batchSize = Math.floor(Math.random() * (200 - 10 + 1)) + 10, // Random number between 10 and 200
    banks = BANK_DATA,
    generateDetails = true
  } = customParams;

  const cheques = [];
  let totalAmount = 0;

  for (let i = 0; i < batchSize; i++) {
    let chequeDetails = {};

    if (generateDetails) {
      const chequeAmount = generateChequeAmount();
      totalAmount += parseFloat(chequeAmount.realAmount);      
      chequeDetails = {
        chequeNumber: generateChequeNumber(),
        bankDetails: getRandomBank(),
        accountNumber: generateAccountNumber(),
        amount: chequeAmount.numericAmount,
        amountInWords: chequeAmount.wordAmount,
        date: getCurrentDate()
      };
    }

    cheques.push(chequeDetails);
  }

  return {
    totalCheques: batchSize,
    totalAmount: totalAmount.toLocaleString('en-IN'),
    cheques: cheques,
  };
};

const Cheque_ = () => {
  const [amountLines, setAmountLines] = useState(['', '', '']);
  const [chequeAmount, setChequeAmount] = useState({ 
    numericAmount: '50,892.00', 
    wordAmount: 'Fifty Thousand Eight Hundred and Ninety-Two Rupees Only' 
  });
  const [bankDetails, setBankDetails] = useState({
    name: "Sample Bank Ltd.",
    code: "0987",
    branch: "654",
    accountNumber: "1234567890",
    chequeNumber: "123456"
  });
  const inputRefs = useRef([]);

  // Generate bank details on component mount
  useEffect(() => {
    const randomBank = getRandomBank();
    setBankDetails({
      name: randomBank.name,
      code: randomBank.code,
      branch: randomBank.branch,
      accountNumber: generateAccountNumber(),
      chequeNumber: generateChequeNumber()
    });
  }, []);

  // Generate amount on component mount
  useEffect(() => {
    const newAmount = generateChequeAmount();
    setChequeAmount(newAmount);
    
    // Split word amount into lines
    const words = newAmount.wordAmount.split(' ');
    const lines = ['', '', ''];
    let currentLine = 0;

    words.forEach(word => {
      if (lines[currentLine].length + word.length + 1 > 35) {
        currentLine++;
      }
      
      if (currentLine < 3) {
        lines[currentLine] += (lines[currentLine] ? ' ' : '') + word;
      }
    });

    setAmountLines(lines);
  }, []);

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
    // Get current date
    const currentDate = new Date();
    
    // Generate a random date within the last 90 days
    const randomDaysAgo = Math.floor(Math.random() * 90); // 0 to 89 days
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - randomDaysAgo);
  
    // Format the date in DD/MM/YYYY and split into individual digits
    return pastDate.toLocaleDateString('en-GB').split('/').flatMap(d => 
      d.padStart(2, '0').split('').map(digit => digit)
    );
  };

  // Convert bank name to a CSS-friendly class name
  const bankClass = bankDetails.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace("'", "");

  return (
    <div className={`cheque ${bankClass}`}>
      <div className="cheque-header">
        <div className="bank-name">
          {bankDetails.name}
        </div>
        <div className="date-section">
          <span className="date-label">Date:</span>
          {getCurrentDate().map((digit, index) => (
            <div key={index} className="date-box">{digit}</div>
          ))}
        </div>
      </div>

      

      <div className="amount-section">
        <div className="amount-gradient-band"></div>
        <div className="amount-in-words">
          Rupees:
          {amountLines.map((line, index) => (
            <div key={index} className="amount-line">
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                className="amount-text"
                value={line}
                maxLength={35}
                onChange={(e) => handleAmountLineChange(index, e.target.value)}
                disabled
              />
            </div>
          ))}
        </div>
        <div className="amount-box-container">
          <div className="amount-box">{chequeAmount.numericAmount}</div>
        </div>
      </div>

      <div className="micr">
        <span className="micr-segment" name="cheque-number">C{bankDetails.chequeNumber}C</span>
        <span className="micr-segment " name="bank-branch-code">{bankDetails.code}D{bankDetails.branch}A</span>
        <span className="micr-segment" name="account-number">{bankDetails.accountNumber}C</span>
      </div>
    </div>
  );
};

const Cheque = ({
  bankDetails = {
    name: "Sample Bank Ltd.",
    code: "0987",
    branch: "654",  
  },
  chequeAmount = { 
    numericAmount: '50,892.00', 
    wordAmount: 'Fifty Thousand Eight Hundred and Ninety-Two Rupees Only' 
  },
  date = null,
  chequeNumber=123456,
  accountNumber=1234567890
}) => {


  const prepareAmountLines = () => {
    const words = chequeAmount.wordAmount.split(' ');
    const lines = ['', '', ''];
    let currentLine = 0;

    words.forEach(word => {
      if (lines[currentLine].length + word.length + 1 > 35) {
        currentLine++;
      }
      
      if (currentLine < 3) {
        lines[currentLine] += (lines[currentLine] ? ' ' : '') + word;
      }
    });

    return lines;
  };

  const amountLines = prepareAmountLines();

  const bankClass = bankDetails.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace("'", "");

  return (
    <div className={`cheque ${bankClass}`}>
      <div className="cheque-header">
        <div className="bank-name">
          {bankDetails.name}
        </div>
        <div className="date-section">
          <span className="date-label">Date:</span>
          {date.map((digit, index) => (
            <div key={index} className="date-box">{digit}</div>
          ))}
        </div>
      </div>

      <div className="amount-section">
        <div className="amount-gradient-band"></div>
        <div className="amount-in-words">
          Rupees:
          {amountLines.map((line, index) => (
            <div key={index} className="amount-line">
              <input
                type="text"
                className="amount-text"
                value={line}
                maxLength={35}
                disabled
              />
            </div>
          ))}
        </div>
        <div className="amount-box-container">
          <div className="amount-box">{chequeAmount.numericAmount}</div>
        </div>
      </div>

      <div className="micr">
        <span className="micr-segment" name="cheque-number">C{chequeNumber}C</span>
        <span className="micr-segment " name="bank-branch-code">{bankDetails.code}D{bankDetails.branch}A</span>
        <span className="micr-segment" name="account-number">{accountNumber}C</span>
      </div>
    </div>
  );
};

export default Cheque;