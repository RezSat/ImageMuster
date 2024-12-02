import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import Cheque from './Cheque';
import './ChequeBatch.css';


const ChequeBatch = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cheques, setCheques] = useState([]);
    const [currentChequeIndex, setCurrentChequeIndex] = useState(0);
    const [batchDetails, setBatchDetails] = useState(null);
    
    // Modal states
    const [modalType, setModalType] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [acceptModalMessage, setAcceptModalMessage] = useState('');


    
    // Game-specific states
    const [amountInputs, setAmountInputs] = useState({}); 
    const [enteredAmounts, setEnteredAmounts] = useState({}); 
    const [remainingAmount, setRemainingAmount] = useState(0);

    useEffect(() => {
        if (location.state && location.state.batchCheques) {
            const batchCheques = location.state.batchCheques;
            setCheques(batchCheques);
            setBatchDetails(location.state.batchDetails);
            
            // Initialize remaining amount
            const totalBatchAmount = parseFloat(location.state.batchDetails.batchTotal.replace(/,/g, ''));
            
            // Check if there are previously entered amounts
            const previousEnteredAmounts = location.state.batchDetails.enteredAmounts || {};
            
            // Calculate remaining amount based on previous entries
            const initialRemainingAmount = Object.keys(previousEnteredAmounts).length > 0
                ? calculateRemainingAmount(totalBatchAmount, previousEnteredAmounts)
                : totalBatchAmount;
    
            setRemainingAmount(initialRemainingAmount);
    
            // Initialize amount inputs and entered amounts
            const initialAmountInputs = {};
            const initialEnteredAmounts = {...previousEnteredAmounts};
            
            batchCheques.forEach((cheque, index) => {
                initialAmountInputs[index] = previousEnteredAmounts[index] 
                    ? previousEnteredAmounts[index].toString() 
                    : '';
                
                if (!initialEnteredAmounts[index]) {
                    initialEnteredAmounts[index] = 0;
                }
            });
            
            setAmountInputs(initialAmountInputs);
            setEnteredAmounts(initialEnteredAmounts);
        }
    }, [location.state]);

    // Helper function to calculate remaining amount
    const calculateRemainingAmount = (totalBatchAmount, enteredAmounts) => {
        const totalEnteredAmount = Object.values(enteredAmounts).reduce(
            (sum, amount) => sum + parseFloat(amount || 0), 
            0
        );
        return totalBatchAmount - totalEnteredAmount;
    };

    const handleCloseBatch = () => {
        // Retrieve all batches from localStorage before navigating
        const savedBatches = JSON.parse(localStorage.getItem('chequeBatches') || '[]');
        
        // Find and update the specific batch
        const updatedBatches = savedBatches.map(batch => {
            if (batch.batchNo === batchDetails.batchNo) {
                return { 
                    ...batch, 
                    enteredAmounts: enteredAmounts,
                    remainingAmount: remainingAmount,
                    batchStatus: remainingAmount === 0 ? 'Completed' : 'Partially Processed'
                };
            }
            return batch;
        });
    
        // Save updated batches back to localStorage
        localStorage.setItem('chequeBatches', JSON.stringify(updatedBatches));
    
        // Navigate with the updated batch information
        navigate('/repair-batches', { 
            state: { 
                currentBatch: {
                    batchDetails: {
                        ...batchDetails,
                        batchNo: batchDetails.batchNo,
                        enteredAmounts: enteredAmounts
                    },
                    enteredAmounts: enteredAmounts,
                    remainingAmount: remainingAmount
                }
            } 
        });
    };

    const handleAcceptButton = () => {
        if (remainingAmount === 0) {
            // If balance is zero, show confirmation modal
            setAcceptModalMessage('Do you want to complete the batch?');
            setIsAcceptModalOpen(true);
        } else {
            // If balance is not zero, show imbalance message
            setAcceptModalMessage('Imbalance detected! Please ensure the remaining balance is zero.');
            setIsAcceptModalOpen(true);
        }
    };

    const handleConfirmBatchCompletion = () => {
        // Logic to go back to repair batches
        handleCloseBatch(); // Adjust the route as needed
    };
    
    

    const handleAmountChange = (index, value) => {
        const newAmountInputs = {...amountInputs};
        newAmountInputs[index] = value;
        setAmountInputs(newAmountInputs);
    };

    const handleAmountKeyDown = (e) => {
        if (e.key === 'Enter') {
            const inputAmount = parseFloat(amountInputs[currentChequeIndex].replace(/,/g, ''));
            
            if (!isNaN(inputAmount)) {
                const newEnteredAmounts = {...enteredAmounts};
                const previousAmount = newEnteredAmounts[currentChequeIndex] || 0;
                
                setRemainingAmount(prev => {
                    if (previousAmount === 0) {
                        return prev - inputAmount;
                    } else {
                        return prev + previousAmount - inputAmount;
                    }
                });

                newEnteredAmounts[currentChequeIndex] = inputAmount;
                setEnteredAmounts(newEnteredAmounts);
            }

            nextCheque();
        }
    };

    const nextCheque = () => {
        if (currentChequeIndex < cheques.length - 1) {
            // Move to next cheque if not on last cheque
            setCurrentChequeIndex(prev => prev + 1);
        } else {
            
            // On last cheque
            const allAmountsEntered = Object.values(amountInputs).every(input => input.trim() !== '');
            
            /*if (allAmountsEntered) {
                // Ensure state is fully updated before checking balance
                //const finalRemainingAmount = calculateFinalRemainingAmount();
                const isBalanced = (parseFloat(remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) == 0);
                if (isBalanced) {
                    setModalType('success');
                    setModalMessage('Congratulations! You have successfully completed the batch.');
                    
                } else {
                    setModalType('warning');
                    setModalMessage('There is an imbalance. Please review and adjust the batch.');
                    
                }
                setModalOpen(true);
            }*/
        }
    };


    const Modal = ({ isOpen, onClose, type, message }) => {
        if (!isOpen) return null;

        const handleClose = () => {
            if (type === 'warning') {
                const isBalanced = (parseFloat(remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) == 0);
                
                if (isBalanced) {
                    // If balanced, change to success
                    setModalType('success');
                    setModalMessage('Congratulations! You have successfully completed the batch.');
                }
            }
            onClose();
        };

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${type}`}>
                <div className="modal-header">
                    {type === 'warning' && <span className="warning-icon">⚠️</span>}
                    {type === 'success' && <span className="success-icon">✅</span>}
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={handleClose}>
                        {type === 'warning' ? 'Review Batch' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};
    const previousCheque = () => {
        if (currentChequeIndex > 0) {
            setCurrentChequeIndex(prev => prev - 1);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="cheque-batch-container">
            {/* Modal Component */}
            <Modal 
                isOpen={modalOpen} 
                onClose={closeModal} 
                type={modalType}
                message={modalMessage}
            />
            

            {batchDetails && (
                <div className="cheque-batch-header">
                    <div className="cheque-info">
                        <span>Batch No: {batchDetails.batchNo}</span>
                        <span>Total Cheques: {cheques.length}</span>
                        <span>Current Cheque: {currentChequeIndex + 1} / {cheques.length}</span>
                        <span>Total Amount: {batchDetails.batchTotal}</span>
                        <span 
                            className={`remaining-amount ${remainingAmount === 0 ? 'zero-balance' : ''}`}
                        >
                            Remaining Amount: {remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <button 
                            className="close-batch-btn" 
                            onClick={handleCloseBatch}
                        >
                            ✖ Close Batch
                        </button>
                        <button 
                            className="accept-batch-btn" 
                            onClick={handleAcceptButton}
                        >
                            Accept Batch
                        </button>

                        {isAcceptModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        Batch Confirmation
                    </div>
                    <div className="modal-body">
                        {acceptModalMessage}
                    </div>
                    <div className="modal-footer">
                        {remainingAmount === 0 ? (
                            <>
                                <button 
                                    onClick={handleConfirmBatchCompletion}
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setIsAcceptModalOpen(false)}
                                >
                                    No
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsAcceptModalOpen(false)}
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
                    </div>
                </div>
            )}

            <div className="cheque-batch-scroll">
                {cheques.length > 0 && (
                    <div className="cheque-wrapper">
                        <Cheque 
                            bankDetails={cheques[currentChequeIndex].bankDetails} 
                            chequeAmount={{ 
                                numericAmount: cheques[currentChequeIndex].amount, 
                                wordAmount: cheques[currentChequeIndex].amountInWords 
                            }} 
                            date={cheques[currentChequeIndex].date}
                            chequeNumber={cheques[currentChequeIndex].chequeNumber}
                            accountNumber={cheques[currentChequeIndex].accountNumber}
                        />
                    </div>
                )}
            </div>

            <div className="cheque-batch-controls bottom-controls">
                <div className="amount-input-section">
                    <input 
                        type="text" 
                        placeholder="Enter Amount" 
                        value={amountInputs[currentChequeIndex] || ''}
                        onChange={(e) => handleAmountChange(currentChequeIndex, e.target.value)}
                        onKeyDown={handleAmountKeyDown}
                        className="amount-input"
                    />
                </div>
                
                <div className="navigation-controls">
                    <button onClick={previousCheque} disabled={currentChequeIndex === 0}>
                        &lt;-
                    </button>
                    
                    <button onClick={nextCheque} disabled={currentChequeIndex === cheques.length - 1}>
                        -&gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChequeBatch;