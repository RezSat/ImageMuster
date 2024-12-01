import React, { useState, useEffect } from 'react';
import { generateChequeBatch } from './Cheque';
import './RepairBatches.css';
import { useNavigate, useLocation } from 'react-router-dom';

const RepairBatches = () => {
  const [batches, setBatches] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  const savedBatches = localStorage.getItem('chequeBatches');
  
  if (savedBatches && savedBatches !== '[]') {
    try {
      const parsedBatches = JSON.parse(savedBatches);
      // Ensure parsedBatches is an array
      if (Array.isArray(parsedBatches)) {
        setBatches(parsedBatches);
      } else {
        console.error('Parsed batches is not an array:', parsedBatches);
        generateInitialBatches();
      }
    } catch (error) {
      console.error('Error parsing chequeBatches from localStorage:', error);
      generateInitialBatches();
    }
  } else {
    generateInitialBatches();
  }

  if (location.state?.currentBatch) {
    updateBatchInList(location.state.currentBatch);
  }
}, [location.state]);  

  const generateInitialBatches = () => {
    const newBatches = [];
    for (let i = 0; i < 5; i++) {
      const batchDetails = generateChequeBatch();
      newBatches.push({
        id: i + 1,
        batchNo: `6000${i + 1}`,
        noOfCheques: batchDetails.totalCheques,
        noOfSlips: 1,//Math.floor(batchDetails.totalCheques / 10), // Assuming some slips
        batchTotal: batchDetails.totalAmount,
        batchStatus: 'Pending',
        cheques: batchDetails.cheques, // Store full cheque details
        enteredAmounts: {} // Track entered amounts
      });
    }
    setBatches(newBatches);
    localStorage.setItem('chequeBatches', JSON.stringify(newBatches));
  };

  const updateBatchInList = (updatedBatch) => {
    console.log('Updating batch in list:', updatedBatch);
    
    const currentBatches = JSON.parse(localStorage.getItem('chequeBatches') || '[]');
    
    const updatedBatches = currentBatches.map(batch => {
        if (batch.batchNo === updatedBatch.batchDetails?.batchNo) {
            return { 
                ...batch, 
                enteredAmounts: updatedBatch.enteredAmounts || {},
                remainingAmount: updatedBatch.remainingAmount,
                batchStatus: updatedBatch.remainingAmount === 0 ? 'Completed' : 'Partially Processed'
            };
        }
        return batch;
    });

    console.log('Updated batches:', updatedBatches);
    setBatches(updatedBatches);
    localStorage.setItem('chequeBatches', JSON.stringify(updatedBatches));
};

  const handleRowSelect = (batch) => {
    setSelectedRow(batch.id === selectedRow ? null : batch.id);
  };

  const handleSelectBatch = () => {
    if (selectedRow) {
        const selectedBatch = batches.find(b => b.id === selectedRow);
        navigate('/cheque-batch', { 
            state: { 
                batchCheques: selectedBatch.cheques,
                batchDetails: {
                    ...selectedBatch,
                    enteredAmounts: selectedBatch.enteredAmounts || {}
                },
                allBatches: batches
            } 
        });
    }
};

  const handleRefresh = () => {
    generateInitialBatches();
  };

  const handleClose = () => {
    // Implement close functionality
    localStorage.setItem('chequeBatches', JSON.stringify("[]"));
    navigate('/'); // or wherever you want to navigate
  };

  return (
    <div className="repair-batches-container">
      <div className="repair-batches-header">
        <div className="repair-batches-actions">
          <button onClick={handleRefresh}>Refresh</button>
          <button 
            onClick={handleSelectBatch} 
            disabled={!selectedRow}
          >
            Select Batch
          </button>
          <button onClick={handleClose}>Close</button>
        </div>
      </div>

      <table className="repair-batches-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Batch</th>
            <th>Chqs</th>
            <th>Slips</th>
            <th>Batch Total</th>
            <th>Batch Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr 
              key={batch.id}
              onClick={() => handleRowSelect(batch)}
              className={selectedRow === batch.id ? 'selected-row' : ''}
            >
              <td data-label="No">{batch.id}</td>
              <td data-label="Batch">{batch.batchNo}</td>
              <td data-label="Chqs">{batch.noOfCheques}</td>
              <td data-label="Slips">{batch.noOfSlips}</td>
              <td data-label="Batch Total">{batch.batchTotal}</td>
              <td data-label="Batch Status">{batch.batchStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default RepairBatches;