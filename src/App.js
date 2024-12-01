// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import RepairBatches from './components/RepairBatches';
import ChequeBatch from './components/ChequeBatch';
import HomePage from './components/HomePage'; // Import the HomePage component
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Set the home page route */}
        <Route path="/repair-batches" element={<RepairBatches />} />
        <Route path="/cheque-batch" element={<ChequeBatch />} />
      </Routes>
    </Router>
  );
}

export default App;