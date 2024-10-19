// We need the setBoard function, a function which takes a gate, and the qubits, then 
// makes an API call to the backend. Based on the response, it then updates the board.

export function boardUpdater(board,setBoard,gate){
    // @param setter setBoard: function to update the board
    // @param Object Gate gate: the gate object
    // @param Object[] qubits: the qubits that the gate is on
    // @return void
    const qubits = gate.qubits
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
    fetch(sourceURL, requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            // setBoard(data);
            board.updateProbabilities(data.probabilities);
            setBoard(board);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
export function serverBoardInitializer(plusSpaces, minusSpaces) {
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
    return fetch(sourceURL, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Server response:', data);
        return true;
      })
      .catch((error) => {
        console.error('Error initializing board:', error);
        return false;
      });
  }
