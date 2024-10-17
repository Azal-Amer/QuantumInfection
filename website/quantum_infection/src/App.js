import React, { useRef, useState } from 'react';
import './App.css';
import PlayerBoard from './Board/PlayerBoard';
import GatePalate from './gatePalate/gatePalate';

function App() {
  const [gates, setGates] = useState(false);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);
  const [activeGateUses, setActiveGateUses] = useState(0);
  // The above will keep track of the number of times the 
  // present gate has been used

  return (
    <div className="App">
      <header className="App-header">
        <div style={{
          display: 'flex',
          width: '100%',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Refactor to make this in actual CSS elements, please man */}
          <div style={{
            flex: '2',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
            }}>
              <div style={{
                marginRight: '20px',
                width: '200px',
                textAlign: 'left'
              }}>
                {boardInfo && (
                  <div>
                    <p>
                      {boardInfo.type}: ({boardInfo.x}, {boardInfo.y})
                      <br />
                      Gates: {boardInfo.gates && boardInfo.gates.length > 0 
                        ? `(${boardInfo.gates})`
                        : '(None)'}
                        <br />
                        Probabilities:(
                          {boardInfo.p0}, 
                          {boardInfo.p1}
                          )
                    </p>
                  </div>
                )}
              </div>
              <PlayerBoard 
                gates={gates} 
                activeGate={activeGate} 
                setActiveGate={setActiveGate} 
                ref={playerBoardRef}
                setBoardInfo={setBoardInfo}
                activeGateUses={activeGateUses}
                setActiveGateUses={setActiveGateUses}
              />
            </div>
          </div>
          <div style={{
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <GatePalate
              activeGate={activeGate}
              setActiveGate={setActiveGate}
              playerBoardRef={playerBoardRef}
              activeGateUses={activeGateUses}
              setActiveGateUses={setActiveGateUses}
            />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;