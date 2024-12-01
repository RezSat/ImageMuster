import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RepairBatches from './components/RepairBatches';
import ChequeBatch from './components/ChequeBatch';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/repair-batches" 
          element={<RepairBatches />} 
        />
        <Route 
          path="/cheque-batch" 
          element={<ChequeBatch />} 
        />
      </Routes>
    </Router>
  );
}

export default App;