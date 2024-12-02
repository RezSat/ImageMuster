// HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleImageClick = () => {
    setShowModal(true);

    // Navigate to repair batches after 5 seconds
    setTimeout(() => {
      navigate('/repair-batches');
    }, 7000);
  };

  return (
    <div className="home-page-container">
      <img 
        src={`${process.env.PUBLIC_URL}/home2.png`} 
        alt="Home" 
        className="responsive-image"
        onClick={handleImageClick}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img 
              src="https://www.digitalcheck.com/wp-content/uploads/2020/04/single-feed-400px-3.gif" 
              alt="Scanning" 
              className="modal-gif"
            />
            <p>Scanning Deyyo wada karannna patan gattaaa..!</p>
            <br></br>
            <p>Poddak inna tak gahala batch tikak dala dennan.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;