
let isGameOver = false;
var math = require("mathjs");

let initialized = false;
import { NonLinearQuantumCircuit } from './NonLinearQuantumCircuit';
let circuit = null;
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
  circuit.run();
  const measurementResults = circuit.measureAllMultishot(1024);
  console.log('Measurement results:', measurementResults);
  const mostProbableState = processMeasurements(measurementResults);
  console.log('Most probable state:', mostProbableState);

  board.updateProbabilities(probabilityRefactorer(mostProbableState));
  setBoard(board.clone());


  return Promise.resolve(true);
}

export function boardUpdater(board, setBoard, gate) {
  if (checkGameOver()) return;

  const qubits = gate.qubits;
  const gateName = gateNameCleanser(gate.kind);
  console.log(gateName);
  let targetQubits;
  if((qubits.length)>1){
    console.log(gate.qubits);
    targetQubits = gate.qubits.map(qubit => qubitFromXY(qubit));
  }
  else{
    targetQubits = qubitFromXY(gate.qubits[0]);
  }
  console.log(targetQubits);
  circuit.appendGate(gateName,targetQubits);
  circuit.run();
  const probabilities = circuit.probabilities();
  console.log('Probabilities:', probabilities);
  board.updateProbabilities(probabilityRefactorer(probabilities));
  setBoard(board.clone());


  
  return Promise.resolve(true)
}



export function serverBoardInitializer(plusSpaces, minusSpaces) {
  if (checkGameOver()) return Promise.resolve(false);
  if(initialized){ return Promise.resolve(true); }
  const SIZE = 4;
  circuit = new NonLinearQuantumCircuit(SIZE**2);
  // This needs to be size adaptable TODO
  circuit.appendGate('x', (SIZE**2)-1);
  // Setting first state to |1>
  minusSpaces.forEach(space => {
    console.log('Adding X gate to space:', space);
    circuit.appendGate('x', qubitFromXY(space));
    console.log(qubitFromXY(space))
  });
  for (let i = 1; i < (SIZE**2)-1; i++) {
    circuit.appendGate("h", i);
    console.log(i);
  }
  
    circuit.addNonLinearGateType("w", (state, probability) => {
      const phase = math.complex(
          Math.cos(probability * Math.PI * 2),
          Math.sin(probability * Math.PI * 2)
      );
      console.log('state before w',state)
      // const angle = math.multiply(math.complex(0,1),probability*2*math.pi)
      // const phase = math.exp(angle);
      // const phase =math.exp(math.multiply(math.complex(0,1), probability * 2 * math.pi))
      return math.multiply(state, phase); // Apply the phase
  });
  

  console.log('Initializing board with plusSpaces:', plusSpaces, 'and minusSpaces:', minusSpaces);
  circuit.run();
  console.log(circuit.stateAsString(true))



  initialized = true;
  return Promise.resolve(true);
}
/**
 * this function straight up just cleans up
 * a given gate name so that it can be understood
 * by quantum-circuit
 * @param {string} name
 */
function gateNameCleanser(name){
  // make the name lowercase, and only a-z
  return name.toLowerCase().replace(/[^a-z]/g,'');

}

function qubitFromXY(xy){
  let x;
  let y;
  if(Array.isArray(xy)){
    y = xy[1];
    x = xy[0];
  }
  else{
    x = xy.x;
    y = xy.y;
  }
  return y*4 + x;

}
/**
 * In previous versions of this program, with the server
 * the probabilities were returned as a 2d in the form
 * [[i,P(0),P(1)]...]
 * We want to make our new probabilities array in that form
 * @param {int[]} probabilities from quantum-circuit
 */
function probabilityRefactorer(probabilities){
  let newProbabilities = [];
  for(let i = 0; i < probabilities.length; i++){
    newProbabilities.push([i,1-probabilities[i],probabilities[i]]);
  }
  return newProbabilities;
  
}
/**
 * This function will take the results of all
 * the shots we threw at the simulator, and 
 * return the most probable state as an array.
 * 
 * @param {map{String:int}} measurementCounts 
 * @returns 
 */
function processMeasurements(measurementCounts) {
  // Find the state with the highest count
  let maxCount = 0;
  let mostFrequentState = '';
  
  for (const [state, count] of Object.entries(measurementCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentState = state;
    }
  }
  
  // Convert the binary string to an array, reversing the order
  // Example: if mostFrequentState is '10', we first split to ['1','0']
  // then reverse to get ['0','1'] for correct qubit ordering
  return mostFrequentState.split('').reverse().map(bit => parseInt(bit));
}

// Function to reset the game state (use this when starting a new game)
export function resetGameState() {
  isGameOver = false;
  initialized = false;
}
