let isGameOver = false;

function checkGameOver() {
  if (isGameOver) {
    console.log('Game is over. No further operations allowed.');
    return true;
  }
  return false;
}

export function endBoardUpdater(board, setBoard) {
  console.log('endBoardUpdater called');
  if (checkGameOver()) return;

  isGameOver = true; // Set the game over flag immediately

  return fetch('http://127.0.0.1:5000/end_game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => response.json())
    .then(data => {
      console.log('Game ended:', data);
      board.updateProbabilities(data.probabilities);
      var updatedBoard = board.clone();
      updatedBoard.locked = true;
      setBoard(updatedBoard);
      console.log('Board updated:', updatedBoard);
    })
    .catch(error => {
      console.error('Error ending game:', error);
    });
}

export function boardUpdater(board, setBoard, gate) {
  console.log('Board updater called with gate:', gate);
  if (checkGameOver()) return;

  const qubits = gate.qubits;
  const sourceURL = 'http://127.0.0.1:5000/apply_gate';
  const data = {
    gate: gate.kind,
    qubits: qubits
  };
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
  return fetch(sourceURL, requestOptions)
    .then(response => response.json())
    .then(data => {
      if (checkGameOver()) return; // Check again before updating
      console.log(data);
      board.updateProbabilities(data.probabilities);
      console.log('locked', board.locked);
      setBoard(board.clone());
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

let initialized = false;

export function serverBoardInitializer(plusSpaces, minusSpaces) {
  if (checkGameOver()) return Promise.resolve(false);
  if(initialized){ return Promise.resolve(true); }

  console.log('Initializing board with plusSpaces:', plusSpaces, 'and minusSpaces:', minusSpaces);
  const sourceURL = 'http://127.0.0.1:5000/initializeBoard';
  const data = {
    plusSpaces: plusSpaces,
    minusSpaces: minusSpaces
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include',
    mode: 'cors'
  };
  initialized = true;
  return fetch(sourceURL, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (checkGameOver()) return false; // Check again before processing
      console.log('Server response:', data);
      return true;
    })
    .catch(error => {
      console.error('Error initializing board:', error);
      return false;
    });
}

// Function to reset the game state (use this when starting a new game)
export function resetGameState() {
  isGameOver = false;
  initialized = false;
}