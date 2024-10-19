import React, { useRef, useState } from 'react';
import './App.css';
import './alertBox/Alert.css';
import PlayerBoard from './Board/PlayerBoard';
import GatePalate from './gatePalate/gatePalate';
import { AlertProvider } from './alertBox/AlertContext';
import  AlertBox  from './alertBox/AlertBox';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex';
function AppContent() {
  const [gates] = useState(false);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);
  const [activeGateUses, setActiveGateUses] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [placedGates, setPlacedGates] = useState([]);
  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

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