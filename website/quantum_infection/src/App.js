import React, { useRef, useState,useCallback ,useEffect} from 'react';
import './App.css';
import './alertBox/Alert.css';
import PlayerBoard from './Board/PlayerBoard';
import GatePalate from './gatePalate/gatePalate';
import { AlertProvider } from './alertBox/AlertContext';
import  AlertBox  from './alertBox/AlertBox';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex';
import InstructionsPopup from './Instructions/InstructionsPopup';
import './Instructions/InstructionsPopup.css';
import RoundsTracker from './Rounds/RoundsTracker';
import { resetGameState } from './Board/boardUpdater';
function AppContent() {
  const [gates] = useState(false);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);
  const [activeGateUses, setActiveGateUses] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [placedGates, setPlacedGates] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [rounds, setRounds] = useState(0);
  const [winner, setWinner] = useState(null);
  const resetGame = useCallback(async () => {
    // Reset game state in boardUpdater
    resetGameState();
    
    // Dispatch reset event for components to handle their own reset logic
    window.dispatchEvent(new Event('gameReset'));
    
    // Reset local state
    setActiveGate(null);
    setActiveGateUses(0);
    setPlacedGates([]);
    setRounds(0);
    setBoardInfo(null);
    setWinner(null);
    
    // Hide any active alerts
    hideAlert();
  }, []);
  const showAlert = useCallback((type, title, message, actions = []) => {
    setAlert({ show: true, type, title, message, actions });
  }, []);

  
  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };
  // this effect waits to hear back from the PlayerBoard, to see who actually won the game
  useEffect(() => {
    const handleWinner = (event) => {
      setWinner(event.detail);
      showAlert(
        'success',
        event.detail ? `Game Over, ${event.detail} wins!` : 'Game Over!',
        'Congratulations! The game has ended. Take a moment to review the final board state.' +
        '<br /><br />Click "Play Again" to start a new game, or review your moves before continuing.',
        [{
          label: 'Play Again',
          onClick: resetGame
        }]
      );
    };
    window.addEventListener('gameWinner', handleWinner);
    return () => {
      window.removeEventListener('gameWinner', handleWinner);
    };
  }, []);
  // This just sends out the waiting for the endgame
  const handleGameEnd = useCallback(() => {

  }, [showAlert, resetGame, winner]);

  
  // Add the event listener for endGame
  useEffect(() => {
    const endGameListener = () => {
      handleGameEnd();
    };

    window.addEventListener('endGame', endGameListener);
    return () => {
      window.removeEventListener('endGame', endGameListener);
    };
  }, [handleGameEnd]);
  
  const instructionsContent = [
    {
      title: "Welcome to Quantum Infection",
      content: "To play, find a friend! There are two players: Alice and Bob, competing to control quantum states. Alice aims to measure qubits in state $|1\\rangle$, while Bob aims for $|0\\rangle$. The game starts with a special pattern of plus ($|+\\rangle$) and minus ($|-\\rangle$) states, with corners set to $|0\\rangle$ and $|1\\rangle$. After 20 rounds, all qubits will be measured - try to control as many as possible!"
    },
    {
      title: "Playing the Game",
      content: "Each turn, you can apply one quantum gate to change the state of qubits. Single-qubit gates (H, X, Z, S) can only be applied to qubits adjacent to ones you control. Two-qubit gates (CNOT) can be used between any adjacent qubits if at least one is next to a controlled qubit. Some gates have limited uses - use them wisely! Once you start placing a multi-qubit gate, you must complete it."
    },
    {
      title: "Board Information",
      content: "The board shows probabilities of measuring each qubit as $|0\\rangle$ (blue, Bob) or $|1\\rangle$ (red, Alice). Hover over squares to see applied gates and exact probabilities. Darker colors mean higher probability of that player winning the square. The game uses quantum superposition, so outcomes aren't certain until measurement!"
    }
  ];

  return (
      
      <div className="App">
        
      <header className="App-header">
        <div className="layout-container">
          <div className="left-container">
            
            <div className="board-wrapper">
            <RoundsTracker onGameEnd={handleGameEnd} /> 
              <PlayerBoard
                gates={gates}
                activeGate={activeGate}
                setActiveGate={setActiveGate}
                ref={playerBoardRef}
                setBoardInfo={setBoardInfo}
                activeGateUses={activeGateUses}
                setActiveGateUses={setActiveGateUses}
                showAlert={showAlert}
                hideAlert={hideAlert}
                placedGates={placedGates}
                setPlacedGates={setPlacedGates}
                rounds={rounds}
                setRounds={setRounds}
              />
            </div>
          </div>
          <div className="right-container">
            <div className="alert-container">
              {alert.show && (
                <AlertBox
                type={alert.type}
                title={alert.title}
                message={alert.message}
                actions={alert.actions} // Make sure this line is present
                onClose={hideAlert}
              />
              )}
            </div>
            <div className="gate-palate-container">
              <GatePalate
                activeGate={activeGate}
                setActiveGate={setActiveGate}
                playerBoardRef={playerBoardRef}
                activeGateUses={activeGateUses}
                setActiveGateUses={setActiveGateUses}
                showAlert={showAlert}
                hideAlert={hideAlert}
              />
            </div>
            <div className="board-info-container">
              {boardInfo && (
                <div>
                  <p>
                    {boardInfo.type}: (<Latex>{'$' + boardInfo.x + '$'}</Latex>, <Latex>{'$' + boardInfo.y + '$'}</Latex>)
                    <br />
                    Gates: {boardInfo.gates && boardInfo.gates.length > 0
                      ? <Latex>{ boardInfo.gates }</Latex>
                      : '(None)'}
                    <br />
                    Probabilities: (
                    <Latex>{'$' + boardInfo.p0 + '$'}</Latex>,
                    <Latex>{'$' + boardInfo.p1 + '$'}</Latex>
                    )
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <InstructionsPopup
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        instructions={instructionsContent}
      />
      </header>
      
    </div>
  );
}

function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}

export default App;