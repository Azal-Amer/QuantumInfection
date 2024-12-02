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

  const nonlinearGateTypes = [
    {
        type: 'W',  // Weinberg gate
        qty: null,
        label: 'W',
        kind: 'w',
        color: [147, 112, 219],  // Medium purple for Weinberg gates
        numQubits: 1,
        description: "The Weinberg gate is a nonlinear two-qubit gate that performs an exponential transformation on the target qubit based on the control qubit. It is a fundamental building block for nonlinear quantum algorithms." +
        " <br />For state $$|x,y\\rangle$$, it performs the mapping: $$|x,y\\rangle \\rightarrow |x,e^{ixy}y\\rangle$$" +
        " <br />This gate allows polynomial-time solution of NP-complete problems through nonlinear evolution."
    },
    {
        type: 'G',  // Polynomial gate
        qty: null, 
        label: 'G',
        kind: 'g',
        color: [138, 43, 226],  // Blue violet for polynomial gates
        numQubits: 2,
        description: "The G (polynomial) gate is a nonlinear two-qubit gate that performs a quadratic transformation preserving the 2-norm. It enables powerful nonlinear quantum algorithms." +
        " <br />For state $$|x,y\\rangle$$, it performs the mapping: $$|x,y\\rangle \\rightarrow |x, \\frac{x^2 - y^2}{2Re(xy)}y\\rangle$$" +
        " <br />This gate can be used to implement arbitrary nonlinear transformations when combined with linear gates."
    },
    {
        type: 'N',  // Abrams-Lloyd Nonlinear AND gate
        qty: null,
        label: 'N',
        kind: 'n', 
        color: [186, 85, 211],  // Medium orchid for AND-type gates
        numQubits: 2,
        description: "The N gate is a distinctly nonlinear transformation that acts like a quantum AND operation. It forms the basis for solving NP-complete problems in polynomial time." +
        " <br />It transforms states as follows:" +
        " <br />$$|00\\rangle + |11\\rangle \\rightarrow |01\\rangle + |11\\rangle$$" +
        " <br />$$|01\\rangle + |10\\rangle \\rightarrow |01\\rangle + |11\\rangle$$" +
        " <br />$$|00\\rangle + |10\\rangle \\rightarrow |00\\rangle + |10\\rangle$$"
    }
];

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
  }, [resetGame, showAlert]);
  // This just sends out the waiting for the endgame
  const handleGameEnd = useCallback(() => {
    console.log('Game has ended. Waiting for final measurements...');
    console.log(winner)

  }, [winner]);

  
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
              <GatePalate
              gateTypes = {nonlinearGateTypes}
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
