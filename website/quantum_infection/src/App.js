import React, { useRef, useState } from 'react';
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
function AppContent() {
  const [gates] = useState(false);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);
  const [activeGateUses, setActiveGateUses] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [placedGates, setPlacedGates] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };
  const instructionsContent = [
    {
      title: "Welcome to the Quantum Circuit Game!",
      content: "This game simulates a quantum circuit board where you can place various quantum gates."
    },
    {
      title: "Placing Gates",
      content: "Select a gate from the palette on the right and click on the board to place it. The Hadamard gate (H) rotates your qubit state by 45 degrees: $$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$"
    },
    {
      title: "Board Information",
      content: "The board shows the current state of your qubits. The probabilities represent the chance of measuring $|0\\rangle$ and $|1\\rangle$ states."
    }
    
  ];

  return (
      <div className="App">
      
      <header className="App-header">
        <div className="layout-container">
          <div className="left-container">
            <div className="board-wrapper">
  
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