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

const PlayerBoard = forwardRef(({ gates, activeGate,ref }) => {
  console.log(gates);
  const size = 6; // 6x6 grid
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => customTypeBoard(new BoardSpaces(size), size));
  const [clickedSquare, setClickedSquare] = useState(null);

  const canvasSize = 700; // pixels
  const squareSize = canvasSize / size;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw the grid
    const drawGrid = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const space = board.accessSpace(i, j);
          
          // Fill square with color
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

      // Highlight clicked square if any
      if (clickedSquare) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          clickedSquare.x * squareSize,
          clickedSquare.y * squareSize,
          squareSize,
          squareSize
        );
      }
    };

    drawGrid();
  }, [board, size, squareSize, canvasSize, clickedSquare]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const i = Math.floor(y / squareSize);
    const j = Math.floor(x / squareSize);
    
    setClickedSquare({ x: j, y: i });

    console.log(`Clicked square: (${j}, ${i})`);
    console.log('Active Gate:', activeGate);

    if (activeGate) {
      // Create a copy of the current board's spaces
      const newBoardSpaces = board.spaces.map((row, rowIndex) => 
        row.map((space, colIndex) => {
          if (rowIndex === i && colIndex === j) {
            // Clone the existing space as an instance of the `space` class
            const updatedSpace = new Space(space.x, space.y, space.zeroProb, space.oneProb, space.state);
            
            // Debug: Output the current gates before modification
            console.log(`Before Update - Space[${i},${j}] Gates:`, updatedSpace.gates);

            // Add the gate to the existing gates array or create a new one
            updatedSpace.gates = updatedSpace.gates ? [...updatedSpace.gates, activeGate.type] : ['I', activeGate.type];

            // Debug: Output the new gates array after adding the new gate
            console.log(`After Update - Space[${i},${j}] Gates:`, updatedSpace.gates);

            updatedSpace.updateState();

            // Debug: Output the updated space's state after calling updateState()
            console.log(`Space[${i},${j}] Updated State:`, updatedSpace.state);

            return updatedSpace;
          }
          return space;
        })
      );

      // Create a new board instance with the updated spaces
      const newBoard = new BoardSpaces(size);
      newBoard.spaces = newBoardSpaces;

      // Debug: Output the new board object before setting state
      console.log("New Board after modification:", newBoard);

      // Set the new board
      setBoard(newBoard);
    }
};






  return (
    <div ref={ref}>
      <div>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onClick={handleCanvasClick}
          style={{ border: '1px solid black' }}
        />
        {clickedSquare && (
          <p>
            Clicked square: ({clickedSquare.x}, {clickedSquare.y})
            <br />
            Applied Gates: {clickedSquare.gates && clickedSquare.gates.length > 0 
              ? `(${clickedSquare.gates.join(', ')})`
              : '(None)'}
          </p>
        )}
    </div>

    </div>
  );
});
PlayerBoard.displayName = 'PlayerBoard';
PlayerBoard.propTypes = {
  gates: PropTypes.bool,
  activeGate: PropTypes.object,
  ref: PropTypes.object,
};

export default PlayerBoard;