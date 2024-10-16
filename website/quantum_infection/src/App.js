import React, { useRef, useState } from 'react';
import './App.css';
import PlayerBoard from './Board/PlayerBoard';
import GatePalate from './gatePalate/gatePalate';

function App() {
  const [gates, setGates] = useState(false);
  console.log(setGates);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);

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
                      {boardInfo.type} square: ({boardInfo.x}, {boardInfo.y})
                      <br />
                      Applied Gates: {boardInfo.gates && boardInfo.gates.length > 0 
                        ? `(${boardInfo.gates.join(', ')})`
                        : '(None)'}
                        <br />
                        Probability:(
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
            />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;