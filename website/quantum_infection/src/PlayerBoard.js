import React, { useRef, useEffect, useState } from 'react';
import BoardSpaces from './boardClass'; // Make sure this path is correct

function customTypeBoard(board, size){
  // Original lists
  
  if(size == 6){
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
    // this is column row

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
      board.accessSpace(plusSpaces[i][1],plusSpaces[i][0]).updateState();
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

  return board
}

const PlayerBoard = () => {
  const size = 6; 
  const canvasRef = useRef(null);
  const [hoveredPosition, setHoveredPosition] = useState(null);
  
  const canvasSize = 400; // pixels
  const squareSize = canvasSize / size
  var [board] = useState(new BoardSpaces(size));

  board = customTypeBoard(board, size);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw the grid
    const drawGrid = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const space = board.spaces[i][j];
          
          // Fill square with color
          ctx.fillStyle = space.color;
          ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
          
          // Draw black outline
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.strokeRect(i * squareSize, j * squareSize, squareSize, squareSize);
          
          // Display state in the center of the square
          ctx.fillStyle = 'black';
          ctx.font = '35px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(space.state, (i + 0.5) * squareSize, (j + 0.5) * squareSize);
          
          // Highlight hovered square
          if (hoveredPosition && hoveredPosition.i === i && hoveredPosition.j === j) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.strokeRect(i * squareSize, j * squareSize, squareSize, squareSize);
          }
        }
      }
    };

    drawGrid();
  }, [board, size, squareSize, canvasSize, hoveredPosition]);

  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const i = Math.floor(x / squareSize);
    const j = Math.floor(y / squareSize);
    
    setHoveredPosition({ i, j });
  };

  const handleCanvasMouseLeave = () => {
    setHoveredPosition(null);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ width: '200px', marginRight: '20px' }}>
        {hoveredPosition && board.spaces[hoveredPosition.i] && board.spaces[hoveredPosition.i][hoveredPosition.j] && (
          <div>
            <h3>Square Info:</h3>
            <p>
              Hovered square: ({hoveredPosition.j}, {hoveredPosition.i})<br/>
              State: {board.spaces[hoveredPosition.i][hoveredPosition.j].state}<br/>
              Zero Probability: {board.spaces[hoveredPosition.i][hoveredPosition.j].zeroProb.toFixed(2)}<br/>
              One Probability: {board.spaces[hoveredPosition.i][hoveredPosition.j].oneProb.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      <canvas 
        ref={canvasRef} 
        width={canvasSize} 
        height={canvasSize} 
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default PlayerBoard;