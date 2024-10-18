import React, { useRef, useState } from 'react';
import './App.css';
import './alertBox/Alert.css';
import PlayerBoard from './Board/PlayerBoard';
import GatePalate from './gatePalate/gatePalate';
import { AlertProvider } from './alertBox/AlertContext';
import  AlertBox  from './alertBox/AlertBox';
import 'katex/dist/katex.min.css';
function AppContent() {
  const [gates, setGates] = useState(false);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);
  const [activeGateUses, setActiveGateUses] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
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
              <div className="board-info">
                
              </div>
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
                    {boardInfo.type}: ({boardInfo.x}, {boardInfo.y})
                    <br />
                    Gates: {boardInfo.gates && boardInfo.gates.length > 0
                      ? `(${boardInfo.gates})`
                      : '(None)'}
                    <br />
                    Probabilities: (
                    {boardInfo.p0},
                    {boardInfo.p1}
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