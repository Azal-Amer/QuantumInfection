import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
const RoundsTracker = () => {
  const [currentRound, setCurrentRound] = useState(0);
  const MAX_ROUNDS = 2; // Or whatever your maximum round count is
  const [currentPlayer, setCurrentPlayer] = useState('Alice');
  const handleEndgame = () => {

    window.dispatchEvent(new Event('endGame'));
  };
  // When the game ends, this event gets triggered
  const incrementRound = useCallback(() => {
    setCurrentRound(prevRound => {
      const newRound = prevRound + 1;
      if (newRound >= MAX_ROUNDS) {
        handleEndgame();
      }
      return newRound;

    });
    setCurrentPlayer(prevPlayer => {
      const newPlayer = prevPlayer === 'Alice' ? 'Bob' : 'Alice';
      return newPlayer;
    });

  }, []);

  useEffect(() => {
    console.log("Dispatching playerChange event:", currentPlayer);
    const playerChangeEvent = new CustomEvent('playerChange', { detail: currentPlayer });
    window.dispatchEvent(playerChangeEvent);
  }, [currentPlayer]);
  useEffect(() => {
    const handleReset = () => {
      setCurrentRound(0);
      setCurrentPlayer('Alice');
    };

    window.addEventListener('gameReset', handleReset);
    return () => {
      window.removeEventListener('gameReset', handleReset);
    };
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