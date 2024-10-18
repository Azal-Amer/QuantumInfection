import React from 'react';
import PropTypes from 'prop-types';
import Latex from 'react-latex';
import 'katex/dist/katex.min.css';

const AlertBox = ({ title, message, type }) => {
  const alertColors = {
    success: 'rgba(76, 175, 80, 0.9)',
    warning: 'rgba(255, 152, 0, 0.9)',
    error: 'rgba(244, 67, 54, 0.9)',
    info: 'rgba(33, 150, 243, 0.9)'
  };
  const backgroundColor = alertColors[type] || alertColors.info;

  // Split the message by <br /> tags
  const messageParts = message.split('<br />');

  return (
    <div className="game-container">
      <div className="gate-palette">
        {/* Your gate palette content */}
      </div>
      <div className="board-and-alert-container">
        <div className="board">
          {/* Your game board content */}
        </div>
        <div className="alert-container">
          <div className="alert" style={{ backgroundColor }}>
            <div className="alert-content">
              <div className="alert-title">{title}</div>
              <div className="alert-message">
                {messageParts.map((part, index) => (
                  <React.Fragment key={index}>
                    <Latex>{part}</Latex>
                    {index < messageParts.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AlertBox.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
};

AlertBox.defaultProps = {
  type: 'info'
};

export default AlertBox;