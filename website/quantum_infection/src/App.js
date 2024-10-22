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
    
    // Hide any active alerts
    hideAlert();
  }, []);
  const showAlert = useCallback((type, title, message, actions = []) => {
    setAlert({ show: true, type, title, message, actions });
  }, []);

  
  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };
  const handleGameEnd = useCallback(() => {
    showAlert(
      'success',
      'Game Over!',
      'Congratulations! The game has ended. Take a moment to review the final board state.' + 
      '<br /><br />Click "Play Again" to start a new game, or review your moves before continuing.',
      [{
        label: 'Play Again',
        onClick: resetGame
      }]
    );
  }, [showAlert, resetGame]);
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
      content: "To play, find a friend! There are two players: Alice and Bob. Both of you represent orthogonal states of a qubit, think the zero and one on a computer. In 20 rounds, a pesky scientist will come measure your quantum system. You want to own as many of the squares as possible when that happens. To do that, you need some quantum strategies."
    },
    {
      title: "Placing Gates",
      content: "Select a gate from the palette on the right and click on the board to place it. Clicking on a gate opens a menu discussing it's use. With multi-qubit gates, once you start placing it down you can't stop until you've placed all the qubits, so be careful! To deselect a gate, click away! To select a new one instead, click on the new gate. Gates themselves will visually dim after several moves, but they are still present! To see the gates on a square, simply hover or click on it."
    },
    {
      title: "Board Information",
      content: "The board shows the current state of your qubits. Quantum mechanics uses probability amplitudes, but we can only show classical probability here (the difference will make more sense later). The probabilities represent the chance of measuring $|0\\rangle$ (Bob winning) and $|1\\rangle$ (Alice winning) states. Don't be decieved by the colors, behind the scenes it's all quantum!"
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