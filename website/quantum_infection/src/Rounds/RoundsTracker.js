import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
const RoundsTracker = () => {
  const [currentRound, setCurrentRound] = useState(0);
  const MAX_ROUNDS = 20; // Or whatever your maximum round count is
  const handleEndgame = () => {

    window.dispatchEvent(new Event('endGame'));
  };
  // When the game ends, this event gets triggered
  const incrementRound = useCallback(() => {
    setCurrentRound(prevRound => {
      const newRound = prevRound + 1;
      console.log("that's a round")
      if (newRound >= MAX_ROUNDS) {
        handleEndgame();
      }
      return newRound;
    });
  }, []);
  useEffect(() => {
    // Listen for a custom event that signals a gate has been applied
    const handleGateApplied = () => incrementRound();
    window.addEventListener('gateApplied', handleGateApplied);

    return () => {
      window.removeEventListener('gateApplied', handleGateApplied);
    };
  }, [incrementRound]);
  var displayedRound = currentRound + 1;
  if(displayedRound >= MAX_ROUNDS){
    displayedRound = MAX_ROUNDS;
  }

  return (
    <div className="rounds-tracker">
      <h3>Round:<br/> 
      {displayedRound} / {MAX_ROUNDS}</h3>
    </div>
  );
};

RoundsTracker.propTypes = {
  onGameEnd: PropTypes.func,

};

export default RoundsTracker;