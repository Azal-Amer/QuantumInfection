import React, { forwardRef,useRef, useEffect, useState,useCallback } from 'react';
import PropTypes from 'prop-types';
import {BoardSpaces} from './boardClass'; // Make sure this path is correct
function customTypeBoard(board, size,) {
  if (size === 6) {
    const plusSpaces = [
      [0,1],[0,2],[0,3],[0,5],
      [1,0],[1,2],[1,3],[1,5],
      [2,0],[2,1],[2,3],
      [3,0],[3,1],[3,3],
      [4,1],[4,4],
      [5,1]
    ];
    
    const minusSpaces = [
      [0,4],
      [1,1],[1,4],
      [2,2],[2,4],[2,5],
      [3,2],[3,4],[3,5],
      [4,0],[4,2],[4,3],[4,5],
      [5,0],[5,3],[5,4]
    ];

    for(let i = 0; i < plusSpaces.length; i++){
      board.accessSpace(plusSpaces[i][1],plusSpaces[i][0]).zeroProb = .5;
      board.accessSpace(plusSpaces[i][1],plusSpaces[i][0]).oneProb = .5;
      board.accessSpace(plusSpaces[i][1],plusSpaces[i][0]).state = '+';
      board.accessSpace(plusSpaces[i][1],plusSpaces[i][0]).updateState();
    }
    for(let i = 0; i < minusSpaces.length; i++){
      board.accessSpace(minusSpaces[i][1],minusSpaces[i][0]).zeroProb = .5;
      board.accessSpace(minusSpaces[i][1],minusSpaces[i][0]).oneProb = .5;
      board.accessSpace(minusSpaces[i][1],minusSpaces[i][0]).state = '-';
      board.accessSpace(minusSpaces[i][1],minusSpaces[i][0]).updateState();
    }
  }
  board.accessSpace(0,0).zeroProb = 1;
  board.accessSpace(0,0).oneProb = 0;
  board.accessSpace(0,0).state = 'H';
  board.accessSpace(0,0).updateState();
  board.accessSpace(size-1,size-1).zeroProb = 0;
  board.accessSpace(size-1,size-1).oneProb = 1;
  board.accessSpace(size-1,size-1).state = 'V';
  board.accessSpace(size-1,size-1).updateState();
  return board;
}
const PlayerBoard = forwardRef(({ activeGate,
  setActiveGate,setBoardInfo,
  activeGateUses,setActiveGateUses,showAlert,
  hideAlert,placedGates,setPlacedGates }, ref) => {
  const size = 6; // 6x6 grid
  const canvasRef = useRef(null);
  const [board] = useState(() => customTypeBoard(new BoardSpaces(size), size));
  // The current gameboard setter. the setBoard property will
  // be useful when Ayden implements the probability returning
  const [hoveredSquare, setHoveredSquare] = useState(null);
  // Hovered square, self explanatory
  const [clickedSquare, setClickedSquare] = useState(null);
  // Clicked square, self explanatory
  


  const canvasSize = 700; // pixels
  const squareSize = canvasSize / size;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          
          const space = board.accessSpace(i, j);
          
          // Fill square with its original color
          ctx.fillStyle = space.color;
          ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
          
          // Draw black outline
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.strokeRect(j * squareSize, i * squareSize, squareSize, squareSize);
          // if the square is in the activeGate.qubits, then give it a thick green border
          
          
          // Display state in the center of the square
          ctx.fillStyle = 'black';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(space.state, (j + 0.5) * squareSize, (i + 0.5) * squareSize);
        }
      }
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if(activeGate && activeGate.qubits.some(qubit => qubit.x === j && qubit.y === i)){
            // ctx.strokeStyle = 'green';
            // ctx.lineWidth = 10;
            // ctx.strokeRect(j * squareSize, i * squareSize, squareSize, squareSize);

            ctx.lineWidth = 3;
            ctx.strokeRect(j * squareSize, i * squareSize, squareSize, squareSize);
            ctx.strokeStyle = 'rgba(255, 128, 0, 0.5)';

              ctx.lineWidth = 10; // Reduced line width for visibility
              ctx.strokeRect(j* squareSize,i* squareSize, squareSize, squareSize);
              ctx.strokeStyle = 'yellow';
              ctx.lineWidth = 3;
              
              ctx.strokeRect(
                j * squareSize,
                i* squareSize,
                squareSize,
                squareSize
              );
          }
        }
      }
      for(let i=0; i<placedGates.length; i++){
        console.log('Placed Gates: ',placedGates[i].color);
        const gateColor = currentGateColor((placedGates.length-i),placedGates[i].color)
        console.log('Gate Color: ',gateColor);
        if(placedGates[i].numQubits>1){
          // This runs for the CNOT qubist
          const controlQubit = placedGates[i].qubits[0];
          
          ctx.fillStyle = gateColor;
          ctx.beginPath();
          ctx.arc(controlQubit.x * squareSize + squareSize/2, 
            controlQubit.y * squareSize + squareSize/2, 10, 0, 2 * Math.PI);
          ctx.fill();
          if(placedGates[i].qubits.length>1){
            const targetQubit = placedGates[i].qubits[1];
            // make a line to the second qubit
            ctx.strokeStyle = gateColor;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(controlQubit.x * squareSize + squareSize/2, 
              controlQubit.y * squareSize + squareSize/2);
            cnotConnector(ctx,targetQubit.x * squareSize + squareSize/2,
              targetQubit.y * squareSize + squareSize/2,gateColor);
          }
          else{
            // make a line to the mouse
            ctx.strokeStyle = gateColor;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(controlQubit.x * squareSize + squareSize/2, 
              controlQubit.y * squareSize + squareSize/2);
            if(hoveredSquare){
              cnotConnector(ctx,hoveredSquare.x * squareSize + squareSize/2,
                hoveredSquare.y * squareSize + squareSize/2,
                gateColor);
            }
            else{
              //find the nearest square to the cursor, and put it there
              const x = Math.floor((ctx.clientX - ctx.rect.left) / squareSize);
              const y = Math.floor((ctx.clientY - ctx.rect.top) / squareSize);

              cnotConnector(ctx,x * squareSize + squareSize/2,y * squareSize + squareSize/2,gateColor);
            }
            
          }
        }
        else{
          // This is for all the single qubits
          const qubit = placedGates[i].qubits[0];


          const label = placedGates[i].label || '';

          // Draw the circle
          ctx.fillStyle = gateColor;

          ctx.beginPath();
          ctx.arc(qubit.x * squareSize + squareSize/2, 
                  qubit.y * squareSize + squareSize/2, 
                  20, 0, 2 * Math.PI);
          ctx.fill();

          // Add the label
          // make the fillstyle black with the same alpha as the gate color
          const alpha = parseFloat(gateColor.slice(-4, -1));
          ctx.fillStyle = `rgba(0,0,0,${alpha})`; // Color of the text
          ctx.font = '16px Arial'; // Adjust font size and style as needed
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, 
                      qubit.x * squareSize + squareSize/2, 
                      qubit.y * squareSize + squareSize/2);


        }
        
      }

      // Draw yellow outline for hovered square
      if (hoveredSquare) {


        ctx.strokeStyle = 'rgba(255, 128, 0, 0.5)';
        // make the stroke 50% transparent
        // ctx.globalAlpha = 0.5;
        ctx.lineWidth = 4; // Reduced line width for visibility
        ctx.strokeRect(hoveredSquare.x* squareSize, hoveredSquare.y* squareSize, squareSize, squareSize);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 1;
        
        ctx.strokeRect(
          hoveredSquare.x * squareSize,
          hoveredSquare.y * squareSize,
          squareSize,
          squareSize
        );
      }
      

      // Draw blue outline for clicked square
      if (clickedSquare) {
        
        ctx.strokeStyle = 'rgba(255, 128, 0, 0.5)';
        // make the stroke 50% transparent
        // ctx.globalAlpha = 0.5;
        ctx.lineWidth = 8; // Reduced line width for visibility
        ctx.strokeRect(clickedSquare.x* squareSize, clickedSquare.y* squareSize, squareSize, squareSize);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        
        ctx.strokeRect(
          clickedSquare.x * squareSize,
          clickedSquare.y * squareSize,
          squareSize,
          squareSize
        );
        // This below will drop the active gates in. 
        // It's also where we'd probably make a call to Ayden's interface code
        var safeToTake = true;
        // this below condition decides if
        //  it's safe to allow a qubit to be clicked on
        // In the future, we'd probably use this 
        // to also constrain multi-qubit distance, and initial clicks based on
        // adjacent probabilities
        if(activeGate){
          if(activeGate.qubits.length >0){
            if(activeGate.qubits[0].x === clickedSquare.x && activeGate.qubits[0].y === clickedSquare.y){
              safeToTake = false;
            }
          }
        }

        if(activeGate&&safeToTake){

          const square = board.accessSpace(clickedSquare.y, clickedSquare.x)
          square.gates.push(activeGate);
          setPlacedGates([...placedGates,activeGate]);
          spaceUpdater(board,setBoardInfo,clickedSquare,'Hovered');
          // updating the square that the gate was dropped on, so that the user doesnt have to move their cursor to update it
          setClickedSquare(null); 
          const debug = false;
          if(debug){ 
            console.log('Active Gate Uses: ',activeGateUses); 
            console.log('Active Gate NumQubits: ',activeGate.numQubits);
          }
          activeGate.qubits.push(clickedSquare);
          activeGate.updateGate();
          if(activeGateUses === (activeGate.numQubits-1)){
            setActiveGate(null); 
            hideAlert();
            setActiveGateUses(0);
            console.log('Active Gate is now null');
          }
          
          else{
            setActiveGateUses(activeGateUses+1);
            console.log(activeGate);
            
            console.log('Active Gate Uses: ',activeGateUses);
            showAlert( 'info','Active Gate :'+ activeGate.type +'-Gate', 
              'You have selected '+(activeGateUses+1)+' / '+activeGate.numQubits+' qubits'+'<br />' + activeGate.description);
          } 
             
          // We need a way to keep track of the number of times an individual gate is used. Then, we can compare it to the 
          // numQubits propety of the activeGate. If they're equal, then we can set the activeGate to null.
            
        }
      }
    };

    drawGrid();
  }, [board, size, squareSize, canvasSize, hoveredSquare, clickedSquare]);

  const handleCanvasClick = (event) => {
    // Below will just check if we clicked on a space on the board, and if so, which one
    // NOTE TO SELF, this block below repeats 3 times (twice here, once in game palate). We can put this into a function for personal sake.
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const i = Math.floor(y / squareSize);
    const j = Math.floor(x / squareSize);
    if(clickedSquare !=null && clickedSquare !=undefined){
      if(clickedSquare.x === j && clickedSquare.y === i){
        setClickedSquare(null);
      }
      else{
        if((i>=0 && j>=0 )&& (i<size && j<size)){
          setClickedSquare({ x: j, y: i });
          spaceUpdater(board,setBoardInfo,board.accessSpace(j, i),'Clicked');
        }
      }
    }
    else{
      if((i>=0 && j>=0 )&& (i<size && j<size)){
        setClickedSquare({ x: j, y: i });
        spaceUpdater(board,setBoardInfo,board.accessSpace(j, i),'Clicked');
      }
    }
    
    

    // Above then writes the displaying code
  };
  const handleCanvasHover = (event) => {
    // Similar to the click, this checks wh
    // The error happens because somehow we're letting size 6 come through
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const i = Math.floor(y / squareSize);
    const j = Math.floor(x / squareSize);

    // console.log(i,j);

    
    // try and catch block to prevent errors
    // log i and j
    
    if((i>=0 && j>=0 )&& (i<size && j<size)){
      setHoveredSquare({ x: j, y: i });
      spaceUpdater(board,setBoardInfo,{x:j,y:i},'Hovered');

    }
  };

  const handleCanvasLeave = () => {
    setHoveredSquare(null);
    if(clickedSquare == null){
      setBoardInfo(null);
    }
    else{
  // This will allow us to keep track of what square was clicked
      spaceUpdater(board,setBoardInfo,clickedSquare,'Clicked');

      // REFACTOR: This code repeats 3 times, 
    }
    // setBoardInfo(null);
  };
  const handleOutsideClick = useCallback((event) => {
    if (canvasRef.current && !canvasRef.current.contains(event.target)) {
      setClickedSquare(null);
      setBoardInfo(null);
    }
  }, [setBoardInfo]);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return (
    <div ref={ref}>
      <div>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasHover}
          onMouseLeave={handleCanvasLeave}
          style={{ border: '1px solid black' }}
        />
        {/* the below prints the information locally */}
        {/* {clickedSquare && (
          <p>
            Clicked square: ({clickedSquare.x}, {clickedSquare.y})
            <br />
            Applied Gates: {board.accessSpace(clickedSquare.y, clickedSquare.x).gates && 
              board.accessSpace(clickedSquare.y, clickedSquare.x).gates.length > 0 
              ? `(${board.accessSpace(clickedSquare.y, clickedSquare.x).gates.join(', ')})`
              : '(None)'}
            <br />
            Probability:(
              {board.accessSpace(clickedSquare.y, clickedSquare.x).zeroProb}, 
              {board.accessSpace(clickedSquare.y, clickedSquare.x).oneProb}
              )
          </p>
        )}
        {hoveredSquare && (
          <p>
            Hovered square: ({hoveredSquare.x}, {hoveredSquare.y})
            <br />
            Gates: {hoveredGates.length > 0 ? hoveredGates.join(', ') : 'None'}
            <br />
            Probability:(
              {board.accessSpace(hoveredSquare.y, hoveredSquare.x).zeroProb}, 
              {board.accessSpace(hoveredSquare.y, hoveredSquare.x).oneProb}
              )
          </p>
        )} */}
      </div>
    </div>
  );
});

PlayerBoard.displayName = 'PlayerBoard';
PlayerBoard.propTypes = {
  gates: PropTypes.bool,
  activeGate: PropTypes.object,
  setActiveGate: PropTypes.func,
  setBoardInfo: PropTypes.func,
  setActiveGateUses: PropTypes.func,
  activeGateUses: PropTypes.number,
  showAlert: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired,
  placedGates: PropTypes.array,
  setPlacedGates: PropTypes.func
};
export default PlayerBoard;
function gatesListToLabel(gates) {
  const result = gates.map(gate => `$${gate.label}$`).join(', ');
  return result;
}
function spaceUpdater(board,setBoardInfo,square,label){
      const listedGates = gatesListToLabel(board.accessSpace(square.y, square.x).gates);
      
  // This will allow us to keep track of what square was clicked
      setBoardInfo({
        type: label,
        x: square.x,
        y: square.y,
        gates: listedGates || [],
        p0 : board.accessSpace(square.y, square.x).zeroProb,
        p1 : board.accessSpace(square.y, square.x).oneProb
      });

}
function currentGateColor(distance, color) {
    if (distance > 10) {
        distance = 10;
    }

    const saturation = .9 - (distance / 20); // Starts at 0.5, decreases to 0
    const alpha = (1 - (distance / 10))**3; // Starts at 0.5, decreases to 0

    const r = Math.round(color[0] * saturation + (255 * (1 - saturation)));
    const g = Math.round(color[1] * saturation + (255 * (1 - saturation)));
    const b = Math.round(color[2] * saturation + (255 * (1 - saturation)));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function cnotConnector(ctx, newPosX, newPosY, gateColor) {
  // Draw the line
  ctx.strokeStyle = gateColor;
  ctx.lineTo(newPosX, newPosY);
  ctx.stroke();

  // Draw the circle
  ctx.fillStyle = gateColor;
  ctx.beginPath();
  ctx.arc(newPosX, newPosY, 20, 0, 2 * Math.PI);
  ctx.fill();

  // Draw the cross
  // get the alpha from gatecolor
  var alpha = parseFloat(gateColor.slice(-4, -1));

  console.log('Alpha:', alpha);
  if(alpha<1){
    alpha = 0;
  }
  ctx.strokeStyle = `rgba(${0}, ${0}, ${0}, ${alpha})`;  // Color of the cross
  ctx.lineWidth = 2;  // Width of the cross lines
  const crossSize = 10;  // Size of the cross

  ctx.beginPath();
  // Horizontal line
  ctx.moveTo(newPosX - crossSize, newPosY);
  ctx.lineTo(newPosX + crossSize, newPosY);
  // Vertical line
  ctx.moveTo(newPosX, newPosY - crossSize);
  ctx.lineTo(newPosX, newPosY + crossSize);
  ctx.stroke();
}