import React, { forwardRef,useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {BoardSpaces,Space} from './boardClass'; // Make sure this path is correct
function customTypeBoard(board, size) {
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
const PlayerBoard = forwardRef(({ gates, activeGate,setActiveGate,setBoardInfo }, ref) => {
  const size = 6; // 6x6 grid
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => customTypeBoard(new BoardSpaces(size), size));
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [clickedSquare, setClickedSquare] = useState(null);
  const [hoveredGates, setHoveredGates] = useState([]);

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
        if(activeGate){
          console.log(activeGate);
          board.accessSpace(clickedSquare.y, clickedSquare.x).gates.push(activeGate.type);
          setClickedSquare(null);       
          setActiveGate(null);   
        }
      }
    };

    drawGrid();
  }, [board, size, squareSize, canvasSize, hoveredSquare, clickedSquare]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const i = Math.floor(y / squareSize);
    const j = Math.floor(x / squareSize);
    
    setClickedSquare({ x: j, y: i });
    setBoardInfo({
      type: 'Clicked',
      x: j,
      y: i,
      gates: board.accessSpace(i, j).gates || []
    });

    
  };

  const handleCanvasHover = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const i = Math.floor(y / squareSize);
    const j = Math.floor(x / squareSize);
    
    setHoveredSquare({ x: j, y: i });
    setHoveredGates(board.accessSpace(i, j).gates || []);
    setHoveredSquare({ x: j, y: i });

    setBoardInfo({
      type: 'Hover',
      x: j,
      y: i,
      gates: board.accessSpace(i, j).gates || [],
      p0: board.accessSpace(i, j).zeroProb,
      p1: board.accessSpace(i, j).oneProb
    });
  };

  const handleCanvasLeave = () => {
    setHoveredSquare(null);
    setHoveredGates([]);
    setBoardInfo(null);
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
  setBoardInfo: PropTypes.func
};
export default PlayerBoard;