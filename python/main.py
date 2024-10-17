from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import Aer

def qubit_from_square(column,row):
   return 6*row+column-1

def square_from_qubit(qubit):
    return ((qubit+1)%6-1, (qubit)//6)

def initialize(qc):
    for i in [1,3,4,7,9,10,13]:
        qc.h(i)
        state = Statevector.from_label('0'*16)
        state = evolve_state_with_gate(state, 'h', [i])
    for i in [2,5,6,8,11,12,14]:
        qc.x(i)
        qc.h(i)
        state = evolve_state_with_gate(state, 'x', [i])
        state = evolve_state_with_gate(state, 'h', [i])
    qc.x(15)
    state = evolve_state_with_gate(state, 'x', [15])
    return state

def evolve_state_with_gate(state, gate, qubits):
    """Evolves the given statevector with the specified gate on the given qubits."""
    ancqc = QuantumCircuit(16)
    # Apply the gate to the specified qubits
    gate_function = getattr(ancqc, gate)  # Get the gate function from the QuantumCircuit class
    gate_function(*qubits)  # Apply the gate to the specified qubits

    # Evolve the statevector with the applied gate
    return state.evolve(qc)


def gate(qc, qubit, op):
    #turn +=1
    if op == "H":
        qc.h(qubit[0])
    elif op == "X":
        qc.x(qubit[0])
    elif op == "Z":
        qc.z(qubit[0])
    elif op == "S":
        qc.s(qubit[0])
    if op == "CNOT":
        #controlling on qubit[0], target on qubit[1]
        qc.cx(qubit[0],qubit[1])
    elif op == "SWAP":
        qc.swap(qubit[0],qubit[1])
    elif op == "CZ":
        qc.cz(qubit[0],qubit[1])
    else:
        print("Invalid operation")
#include return of probabilities of each outcome

def singleMeasure(qc,qubit):
    """Measures a single qubit and returns the result"""
    qc.measure(qubit,qubit)
    job = backend.run(qc,shots=1)
    results = job.result()
    counts = results.get_counts(qc)
    print(counts)
    result = list(counts.keys())[0]
    print(result)
    print(str(result)[-qubit-1])
    
    cellResult = str(result)[-qubit-1]
    if cellResult == '0':
        aliceSquares.append(qubit)
    elif cellResult == '1':
        bobSquares.append(qubit)
    return cellResult
#use qiskit to return new probabilities of the board

def endMeasure(qc):
    measureList = []
    for i in range(16):
        if i not in aliceSquares and i not in bobSquares:
            # add this to the gate setup
            measureList.append(i)
    print(measureList)
    qc.measure(measureList,measureList)
    job = backend.run(qc,shots=1)
    results = job.result()
    counts = results.get_counts(qc)
    print(counts)
    return [counts,measureList]
        
    
#runs at the end of the game when a certain number of turns have occured
def endGame(qc):
    counts,measureList = endMeasure(qc)
    result = list(counts.keys())[0]
    
    for i in measureList:
        if result[i]=='0':
            aliceSquares.append(i)
        elif result[i]=='1':
            bobSquares.append(i)
    print("End Game")
    print("Alice's squares: ",aliceSquares)
    print("Bob's squares: ",bobSquares)
    alicePoints = len(aliceSquares)
    bobPoints = len(bobSquares)
    if alicePoints>bobPoints:
        print("Alice wins!")
    elif bobPoints>alicePoints:
        print("Bob wins!")
    else:
        print("It's a tie!")

if __name__ == "__main__":
    qc = QuantumCircuit(16,16)
    initialize(qc)
    backend = Aer.get_backend('qasm_simulator')
    aliceSquares = [0]
    bobSquares = [15]
    #aliceTurn = True
    #turn = 0

    print("Hi")
    singleMeasure(qc,5)
    singleMeasure(qc,11)
    endGame(qc)

