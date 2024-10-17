import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Gate } from './gate.js';

const defaultGateTypes = [
  { type: 'X',
     qty: 1, 
     label: 'X-Gate', 
    color: [0, 0, 255],
    numQubits:3 },

  { type: 'Y', 
    qty: 1, 
    label: 'Y-Gate',
     color: 
    [255, 0, 0],
    numQubits:1  },
  { type: 'Z',
     qty: 1, 
     label: 'Z-Gate',
      color:
     [0, 255, 0],
     numQubits:1  },
  {
     type: 'H', 
     qty: 1, 
     label: 'H-Gate', 
     color:[255, 255, 0],
     numQubits:1  },
];

const GatePalate = ({ size = 50, gateTypes = defaultGateTypes, 
  activeGate, setActiveGate, playerBoardRef,setActiveGateUses }) => {
  const canvasRef = useRef(null);
  
  const [gates, setGates] = useState([]);

  useEffect(() => {
    const newGates = gateTypes.map((gate, index) => {
      const x = 10 + (index * (size + 10));
      return new Gate(gate.type, gate.qty, gate.label, gate.color, [x, 10], size, gate.numQubits);
    });
    setGates(newGates);
  }, [gateTypes, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gates.forEach(gate => {
      gate.drawGate(ctx);
      if (gate === activeGate) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(gate.x - 2, gate.y - 2, gate.size + 4, gate.size + 4);
      }
    });
  }, [gates, activeGate]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target) &&
          playerBoardRef.current && !playerBoardRef.current.contains(event.target)) {
        setActiveGate(null);
        setActiveGateUses(0);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [setActiveGate, playerBoardRef]);

  const handleCanvasClick = (event) => {
    event.stopPropagation();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    var clickedGate = gates.find(gate =>
      x >= gate.x && x <= gate.x + gate.size &&
      y >= gate.y && y <= gate.y + gate.size
    );

    
    clickedGate = JSON.parse(JSON.stringify(clickedGate));
    
    // makes clickedGate a new instance of the gate. This hopefully
    // is a deep copy, so the qubits stayed referenced to the original.
    setActiveGate(clickedGate || null);
    setActiveGateUses(0);
    // If we click away, then the gate uses are zero
  };

  const canvasWidth = gates.length * (size + 10) + 10;
  const canvasHeight = size + 20;

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
      {activeGate && (
        <p>Active Gate: {activeGate.label}</p>
      )}
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
};

export default GatePalate;