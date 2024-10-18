import React, { forwardRef,useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {BoardSpaces,Space} from './boardClass'; // Make sure this path is correct
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
const PlayerBoard = forwardRef(({ gates, activeGate,
  setActiveGate,setBoardInfo,
  activeGateUses,setActiveGateUses,showAlert,hideAlert }, ref) => {
  const size = 6; // 6x6 grid
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => customTypeBoard(new BoardSpaces(size), size));
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
          
          // Display state in the center of the square
          ctx.fillStyle = 'black';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(space.state, (j + 0.5) * squareSize, (i + 0.5) * squareSize);
        }
      }

      // Draw yellow outline for hovered square
      if (hoveredSquare) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          hoveredSquare.x * squareSize,
          hoveredSquare.y * squareSize,
          squareSize,
          squareSize
        );
      }


      // Draw blue outline for clicked square
      if (clickedSquare) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          clickedSquare.x * squareSize,
          clickedSquare.y * squareSize,
          squareSize,
          squareSize
        );
        // This below will drop the active gates in. 
        // It's also where we'd probably make a call to Ayden's interface code
        if(activeGate){
          const square = board.accessSpace(clickedSquare.y, clickedSquare.x)
          square.gates.push(activeGate);
          spaceUpdater(board,setBoardInfo,clickedSquare,'Hovered');
          // updating the square that the gate was dropped on, so that the user doesnt have to move their cursor to update it
          setClickedSquare(null); 
          const debug = false;
          if(debug){ 
            console.log('Active Gate Uses: ',activeGateUses); 
            console.log('Active Gate NumQubits: ',activeGate.numQubits);
          }
          if(activeGateUses === (activeGate.numQubits-1)){
            setActiveGate(null); 
            hideAlert();
            setActiveGateUses(0);
            console.log('Active Gate is now null');
          }
          
          else{
            setActiveGateUses(activeGateUses+1);
            console.log('Active Gate Uses: ',activeGateUses);
            showAlert( 'info','Active Gate :'+ activeGate.label, 
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
    if((i>=0 && j>=0 )&& (i<size && j<size)){
      setClickedSquare({ x: j, y: i });
      spaceUpdater(board,setBoardInfo,board.accessSpace(i, j),'Clicked');
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
      console.log(clickedSquare);
  // This will allow us to keep track of what square was clicked
      spaceUpdater(board,setBoardInfo,clickedSquare,'Clicked');

      // REFACTOR: This code repeats 3 times, 
    }
    // setBoardInfo(null);
  };

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
  showAlert: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired,
};
export default PlayerBoard;
function gatesListToLabel(gates,qubits) {
  // At some point, write this so that
  return gates.map(gate => gate.label).join(', ');
}
function spaceUpdater(board,setBoardInfo,square,label){
  console.log(square);
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