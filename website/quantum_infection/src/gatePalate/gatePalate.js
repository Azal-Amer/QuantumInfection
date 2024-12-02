import React, { useRef, useEffect, useState,useCallback } from 'react';
import PropTypes from 'prop-types';
import { Gate } from './gate.js';

const gatesPerRow = 2;
const GatePalate = ({ size = 80, gateTypes, 
  activeGate, setActiveGate, playerBoardRef,activeGateUses,
  setActiveGateUses,showAlert,hideAlert }) => {
  
    
  const canvasRef = useRef(null);
  const [, setCurrentPlayer] = useState('Alice');
  // Since we haven't gotten the player by player implementation working yet, the above and associated code is
  // unlinked from the main logic.
  const [gates, setGates] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const handleGameEnd = () => {
      setIsGameOver(true);
      // Clear any active gate when game ends
      if (activeGate) {
        setActiveGate(null);
        hideAlert();
      }
    };
  
    // Debug logging to verify listener setup
    window.addEventListener('endGame', handleGameEnd);
  
    return () => {
      window.removeEventListener('endGame', handleGameEnd);
    };
    // Remove dependencies that aren't needed for the listener setup
  }, []); // Empty dependency array since we don't need these dependencies for the listener
  // Above is the listener for the endgame
  
  // The initial player is Alice
  
  

  const updateGateQuantities = useCallback(() => {
    setGates(prevGates => prevGates.map(gate => {
      const newGate = gate.clone();
      
      // newGate.qty = player === 'Alice' ? newGate.aliceQty : newGate.bobQty;
      newGate.qty=newGate.aliceQty;

      // This is what switches the new quantity to newgate.qty. I'm hoping that setting property to another
      // would mean that it is just a reference
      return newGate;
    }));
  }, []);

  // This below effect will create the gates, we want to autopopulate with 
  // rows of 4. This WONT draw the gates, but it will create them and space them out
  function initialGates(gateTypes, size) {
    
    return gateTypes.map((gate, index) => {
      const row = Math.floor(index / gatesPerRow);
      const col = index % gatesPerRow;
      const x = 10 + (col * (size + 10));
      const y = 10 + (row * (size + 10));
      
      const newGate = new Gate(
        gate.type, 
        gate.qty, 
        gate.label, 
        gate.color, 
        [x, y], 
        size, 
        gate.numQubits, 
        gate.description
      );
      
      newGate.kind = gate.kind;
      newGate.aliceQty = gate.qty !== null ? Number(gate.qty) : null;
      newGate.bobQty = gate.qty !== null ? Number(gate.qty) : null;
      
      return newGate;
    });
  }
  
  // Then modify your useEffect to use this function:
  useEffect(() => {
    const newGates = initialGates(gateTypes, size);
    setGates(newGates);
  }, [gateTypes, size]);


  // This below effect will update the gate quantities when the player changes
   useEffect(() => {
    const handlePlayerChange = (event) => {
      const newPlayer = event.detail;
      setCurrentPlayer(newPlayer);
      updateGateQuantities(newPlayer);
    };
    
    window.addEventListener('playerChange', handlePlayerChange);

    return () => {
      window.removeEventListener('playerChange', handlePlayerChange);
    };
  }, [updateGateQuantities]);
  

  // this effect will draw the gates on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gates.forEach(gate => {
      ctx.globalAlpha = 1;
      gate.drawGate(ctx, isGameOver);
      // the below gate will outline the gate if it's active
      if (activeGate && gate.type === activeGate.type) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        // make the stroke 50% transparent
        // ctx.globalAlpha = 0.5;
        ctx.lineWidth = 10; // Reduced line width for visibility
        ctx.strokeRect(gate.x, gate.y, gate.size, gate.size);
      }
    });
  }, [gates, activeGate]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // First, let's check if we clicked on any gate palette or selection UI
      const isGatePaletteClick = event.target.closest('.gate-palate-container'); // Add this class to your gate palette containers
      const isGateSelectionClick = event.target.closest('.gate-palate-container'); // Add this class to any other gate selection UI elements
  
      // If we clicked within any gate selection UI, don't treat it as an outside click
      if (isGatePaletteClick || isGateSelectionClick) {
        return;
      }
  
      // Now check if we clicked outside both the canvas and player board
      if (canvasRef.current && !canvasRef.current.contains(event.target) &&
          playerBoardRef.current && !playerBoardRef.current.contains(event.target)) {
        if (activeGate !== null && activeGateUses === 0) {
          setActiveGate(null);
          console.log('outside click');
          hideAlert();
          setActiveGateUses(0);
        }
      }
    };
  
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activeGate, activeGateUses, setActiveGate, setActiveGateUses, playerBoardRef]);
    
    
  //   // If we click away, then the gate uses are zero
  // };
  const handleCanvasClick = useCallback((event) => {
    // This checks to see if a gate has been clicked on
    // event.stopPropagation();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedGate = gates.find(gate =>
      x >= gate.x && x <= gate.x + gate.size &&
      y >= gate.y && y <= gate.y + gate.size
    );
    console.log('Clicked Gate:', clickedGate);

      // This checks if we even have a gate selected at all
      const noActiveGate = activeGate == null;

      // This covers if we did have a gate selected, whether or not it's valid to click away
      if (clickedGate) {
        

        // Makes clickedGate a new instance of the gate.
        const clickedGateCondition = activeGateUses === 0 || activeGateUses === activeGate.numQubits;
        // If we click away before we put a gate down,
          // we can choose another gate, but if not,
          // don't let the user change the gate unless all uses are exhausted
        const validQty = clickedGate.qty !== null ? clickedGate.qty > 0 : true
        if ((noActiveGate ||clickedGateCondition)&&validQty&&(!isGameOver)) {
          // No active gate, so we can select the clicked gate
          const newClickedGate = clickedGate.clone()
          setActiveGate(newClickedGate);
          setActiveGateUses(0);
          showAlert( 'info','Active Gate :'+ newClickedGate.type +'-Gate', 
            'You have selected '+activeGateUses+' / '+newClickedGate.numQubits+' qubits'+'<br />' + newClickedGate.description);
          if (process.env.NODE_ENV === 'development') {
            
            console.log('Active Gate:', activeGate);
            console.log('Clicked Gate:', newClickedGate);
            console.log('Active Gate:', newClickedGate.label);
          }
          
        }
        // If we click away, then the gate uses are zero
      }
  }, [gates, activeGate, activeGateUses, showAlert, setActiveGate, setActiveGateUses]);
  

  const numRows = Math.ceil(gates.length / gatesPerRow);
  const canvasWidth = Math.min(gates.length, gatesPerRow) * (size + 10) + 10;
  const canvasHeight = numRows * (size + 10) + 10;
  const resetGatePalate = useCallback(() => {
    // Reset game over state
    setIsGameOver(false);
    
    // Clear any active gate
    if (activeGate) {
      setActiveGate(null);
      console.log('Active Gate:', activeGate);
      hideAlert();
    }
    
    // Reset player state
    setCurrentPlayer('Alice');
    
    // Reset all gates to initial state with fresh quantities
    const newGates = initialGates(gateTypes, size);
    setGates(newGates);
    
    // Reset canvas- Not sure if I need this yet actually
    // const canvas = canvasRef.current;
    // if (canvas) {
    //   const ctx = canvas.getContext('2d');
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }
  }, [size, gateTypes, activeGate, setActiveGate, hideAlert]);
  
  // Add listener for game reset event
  useEffect(() => {
    const handleGameReset = () => {
      resetGatePalate();
    };
  
    window.addEventListener('gameReset', handleGameReset);
    return () => {
      window.removeEventListener('gameReset', handleGameReset);
    };
  }, [resetGatePalate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%'
    }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

GatePalate.propTypes = {
  size: PropTypes.number,
  gateTypes: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      qty: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.arrayOf(PropTypes.number).isRequired,
      
    })
  ),
  activeGate: PropTypes.object,
  setActiveGate: PropTypes.func.isRequired,
  playerBoardRef: PropTypes.object.isRequired,
  setActiveGateUses: PropTypes.func,
  activeGateUses: PropTypes.number,
  showAlert: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired,
};

export default GatePalate;