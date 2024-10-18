import React, { useRef, useEffect, useState,useCallback } from 'react';
import PropTypes from 'prop-types';
import { Gate } from './gate.js';

const defaultGateTypes = [
  { type: 'X',
     qty: 1, 
     label: 'X', 
    color: [0, 0, 255],
    numQubits:1 ,
    description : "The X gate will flip any state, amplitudes on zero go to one, and vice versa."+
    " <br />$$X = \\begin{pmatrix}0 & 1 \\\\1 & 0\\end{pmatrix}$$"
  },

  { type: 'Y', 
    qty: 1, 
    label: 'Y',
     color: 
    [255, 0, 0],
    description : "The Y gate will rotate your state 90 degrees around the Y axis, providing a phase shift"+
    "  <br />$$Y = \\begin{pmatrix}0 & -i \\\\i & 0\\end{pmatrix}$$",
    numQubits:1  },
  { type: 'Z',
     qty: 1, 
     label: 'Z',
      color:
     [0, 255, 0],
     description : "The Z gate will throw a -1 on your 1 state, and leave your 0 state alone"+
     " <br />$$Z = \\begin{pmatrix}1 & 0 \\\\0 & -1\\end{pmatrix}$$",
     numQubits:1  },
  {
     type: 'H', 
     qty: 1, 
     label: 'H', 
     color:[255, 255, 0],
     numQubits:1,
     description : "The Hadamard gate will rotate your state 45 degrees"+
     " <br />$$H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix}1 & 1 \\\\1 & -1\\end{pmatrix}$$"  },
     {
      type: 'Cx',
      qty: 1,
      label: 'CNOT',
      color: [0, 255, 255],  // Cyan color
      numQubits: 2,  // CNOT operates on 2 qubits
      description: "The CNOT (Controlled-NOT) gate flips the target qubit if the control qubit is |1⟩. It's a two-qubit gate essential for entanglement." +
        " <br />$$CNOT = \\begin{pmatrix}1 & 0 & 0 & 0 \\\\0 & 1 & 0 & 0 \\\\0 & 0 & 0 & 1 \\\\0 & 0 & 1 & 0\\end{pmatrix}$$"
    }
];
const GatePalate = ({ size = 100, gateTypes = defaultGateTypes, 
  activeGate, setActiveGate, playerBoardRef,activeGateUses,
  setActiveGateUses,showAlert,hideAlert }) => {
  const canvasRef = useRef(null);


  
  const [gates, setGates] = useState([]);
  // This effect will create the gates
  useEffect(() => {
    const newGates = gateTypes.map((gate, index) => {
      const x = 10 + (index * (size + 10));
      return new Gate(gate.type, gate.qty, gate.label, gate.color, [x, 10], size, gate.numQubits,gate.description);
    });
    setGates(newGates);
  }, [gateTypes, size]);

  // this effect will draw the gates on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gates.forEach(gate => {
      ctx.globalAlpha = 1;
      gate.drawGate(ctx);
      if (activeGate && gate.type === activeGate.type) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        // make the stroke 50% transparent
        // ctx.globalAlpha = 0.5;
        ctx.lineWidth = 10; // Reduced line width for visibility
        ctx.strokeRect(gate.x, gate.y, gate.size, gate.size);
      }
    });
  }, [gates, activeGate]);

// This one will handle the clicking away from the gate
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target) &&
          playerBoardRef.current && !playerBoardRef.current.contains(event.target)) {
        if (activeGate !== null) {
          console.log('Active Gate:', activeGate);
          if (activeGateUses === 0) {
            // If we click away before we put a gate down, we can choose another gate
            setActiveGate(null);
            hideAlert();
            console.log('Active gate is now null');
            
            setActiveGateUses(0);
          }
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
    event.stopPropagation();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedGate = gates.find(gate =>
      x >= gate.x && x <= gate.x + gate.size &&
      y >= gate.y && y <= gate.y + gate.size
    );

    // This checks if we even have a gate selected at all
    const noActiveGate = activeGate == null;

    // This covers if we did have a gate selected, whether or not it's valid to click away
    if (clickedGate) {
      

      // Makes clickedGate a new instance of the gate.
      // This hopefully is a deep copy, so the qubits stay referenced to the original.
      
      if (noActiveGate) {
        // No active gate, so we can select the clicked gate
        if (process.env.NODE_ENV === 'development') {
          const newClickedGate = clickedGate.clone()
          setActiveGate(newClickedGate);
          setActiveGateUses(0);
          showAlert( 'info','Active Gate :'+ newClickedGate.type +'-Gate', 
            'You have selected '+activeGateUses+' / '+newClickedGate.numQubits+' qubits'+'<br />' + newClickedGate.description);
          console.log('Active Gate:', activeGate);
          console.log('Clicked Gate:', newClickedGate);
          console.log('Active Gate:', newClickedGate.label);
        }
        
      } else if (activeGateUses === 0 || activeGateUses === activeGate.numQubits ) {
        // If we click away before we put a gate down,
        // we can choose another gate, but if not,
        // don't let the user change the gate unless all uses are exhausted
        const newClickedGate = clickedGate.clone()
        setActiveGate(newClickedGate);
        setActiveGateUses(0);
        showAlert( 'info','Active Gate :'+ newClickedGate.label +'-Gate', 
          'You have selected '+activeGateUses+' / '+newClickedGate.numQubits+' qubits'+'<br />' + newClickedGate.description);
        if (process.env.NODE_ENV === 'development') {
          console.log('Active Gate:', activeGate.label);
          console.log('Active Gate Uses:', activeGateUses);
          console.log('Active Gate NumQubits:', activeGate.numQubits);
          console.log('New Active Gate:', newClickedGate.label);
        }
        // setActiveGate(newClickedGate);
        // setActiveGateUses(0);
      }
      // If we click away, then the gate uses are zero
    }
  }, [gates, activeGate, activeGateUses, showAlert, setActiveGate, setActiveGateUses]);
  

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