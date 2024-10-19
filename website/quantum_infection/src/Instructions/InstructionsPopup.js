import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Latex from 'react-latex';
import './InstructionsPopup.css';

const InstructionsPopup = ({ isOpen, onClose, instructions }) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 200); // Match this with the CSS transition duration
  };

  const handleOpen = () => {
    setIsVisible(true);
    setIsClosing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isVisible && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isClosing]);

  return (
    <>
      {!isVisible && (
        <button
          onClick={handleOpen}
          className="instructions-popup-toggle"
        >
          ?
        </button>
      )}
      {isVisible && (
        <div className={`instructions-popup-overlay ${isClosing ? 'closing' : ''}`}>
          <div ref={popupRef} className="instructions-popup-content">
            <div className="instructions-popup-header">
              <h2 className="instructions-popup-title">Instructions and Rules</h2>
              <button onClick={handleClose} className="instructions-popup-close-button">
                ✕
              </button>
            </div>
            <div className="instructions-popup-body">
              {instructions.map((section, index) => (
                <div key={index} className="instructions-popup-section">
                  <h3 className="instructions-popup-section-title">{section.title}</h3>
                  <div className="instructions-popup-section-content">
                    <Latex>{section.content}</Latex>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

InstructionsPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  instructions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default InstructionsPopup;