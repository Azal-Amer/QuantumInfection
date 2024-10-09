import React, { useRef,useState } from 'react';
import './App.css';
import PlayerBoard from './Board/PlayerBoard';
import GatePalate from './gatePalate/gatePalate';

function App() {
  const [gates, setGates] = useState(false);
  console.log(setGates);
  const playerBoardRef = useRef(null);
  const [activeGate, setActiveGate] = useState(null);

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
            <PlayerBoard gates={gates} activeGate={activeGate}  ref={playerBoardRef}/>
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