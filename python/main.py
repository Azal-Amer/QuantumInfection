from qiskit import QuantumCircuit,ClassicalRegister,QuantumRegister
from qiskit.quantum_info import Statevector
from qiskit_aer import Aer

def qubit_from_square(column,row):
   return 6*row+column-1

def square_from_qubit(qubit):
    return ((qubit+1)%6-1, (qubit)//6)

def initialize(qc):
    #initializing the statevector to an all 0 state
    state = Statevector.from_label('0'*16)

    #setting up the quantum circuit to match the starting state of the board
    for i in [1,3,4,7,9,10,13]:
        #statevector is evolved according to the gate applied, [0] acesses the statevector from the return of gate
        #statevector is labeled with the 0 square on the right and the 15 square on the left
        state = gate(qc,[i],"H",state)[0]
    for i in [2,5,6,8,11,12,14]:
        state = gate(qc,[i],"X",state)[0]
        state = gate(qc,[i],"H",state)[0]
    state = gate(qc,[15],"X",state)[0]

    #returns the statevector and the probabilities of each outcome
    return [state,probabilities(state)]

#include return of probabilities of each outcome



def gate(qc, qubits, op, state):
    # Create ancilla quantum circuit to evolve the statevector on each turn
    ancqc = QuantumCircuit(16)
    
    if not isinstance(qubits, list):
        qubits = [qubits]  # Ensure qubits is always a list
    
    if op == "H":
        for qubit in qubits:
            qc.h(qubit)
            ancqc.h(qubit)
        print(f"Applied H gate to qubit(s) {qubits}")
    elif op == "X":
        for qubit in qubits:
            qc.x(qubit)
            ancqc.x(qubit)
        print(f"Applied X gate to qubit(s) {qubits}")
    elif op == "Z":
        for qubit in qubits:
            qc.z(qubit)
            ancqc.z(qubit)
        print(f"Applied Z gate to qubit(s) {qubits}")
    elif op == "Y":
        for qubit in qubits:
            qc.y(qubit)
            ancqc.y(qubit)
        print(f"Applied Y gate to qubit(s) {qubits}")
    elif op == "T":
        for qubit in qubits:
            qc.t(qubit)
            ancqc.t(qubit)
        print(f"Applied T gate to qubit(s) {qubits}")
    elif op == "S":
        for qubit in qubits:
            qc.s(qubit)
            ancqc.s(qubit)
        print(f"Applied S gate to qubit(s) {qubits}")
    elif op == "CNOT":
        if len(qubits) != 2:
            raise ValueError("CNOT gate requires exactly 2 qubits")
        qc.cx(qubits[0], qubits[1])
        ancqc.cx(qubits[0], qubits[1])
        print(f"Applied CNOT gate with control {qubits[0]} and target {qubits[1]}")
    elif op == "SWAP":
        if len(qubits) != 2:
            raise ValueError("SWAP gate requires exactly 2 qubits")
        qc.swap(qubits[0], qubits[1])
        ancqc.swap(qubits[0], qubits[1])
        print(f"Applied SWAP gate between qubits {qubits[0]} and {qubits[1]}")
    elif op == "CZ":
        if len(qubits) != 2:
            raise ValueError("CZ gate requires exactly 2 qubits")
        qc.cz(qubits[0], qubits[1])
        ancqc.cz(qubits[0], qubits[1])
        print(f"Applied CZ gate with control {qubits[0]} and target {qubits[1]}")
    else:
        raise ValueError(f"Invalid operation: {op}")

    # Evolve the state
    state = state.evolve(ancqc)
    
    # Print the updated circuit
    print("Updated Quantum Circuit:")
    print(qc.draw(output='text', fold=150))

    # Calculate and return probabilities
    probabilities = calculate_probabilities(state)
    return state, probabilities

# def calculate_probabilities(state):
#     probs = state.probabilities()
#     return [(i, prob, 1-prob) for i, prob in enumerate(probs)]
#include return of probabilities of each outcome

def calculate_probabilities(state):
    # Get the probabilities for the entire system
    probabilities = state.probabilities_dict()
    squareProbabilities = []
    for i in range(16):
        # Measure the probability of qubit i

        # Compute marginal probabilities for qubit i
        prob_0 = 0
        prob_1 = 0

        for bitstring, prob in probabilities.items():
            if bitstring[::-1][i] == '0':
                prob_0 += prob
            else:
                prob_1 += prob

        #print(f"Probability of qubit {i} being 0: {prob_0}")
        #print(f"Probability of qubit {i} being 1: {prob_1}")
        squareProbabilities.append([i,prob_0,prob_1])
    return squareProbabilities
    # Get the probabilities for the entire system

# def singleMeasure(qc,qubit):
#     """Measures a single qubit and returns the result"""
#     qc.measure(qubit,qubit)
#     job = backend.run(qc,shots=1)
#     results = job.result()
#     counts = results.get_counts(qc)
#     print(counts)
#     result = list(counts.keys())[0]
#     print(result)
#     print(str(result)[-qubit-1])
    
#     cellResult = str(result)[-qubit-1]
#     if cellResult == '0':
#         aliceSquares.append(qubit)
#     elif cellResult == '1':
#         bobSquares.append(qubit)
    
#     return state

def endMeasure(qc):
    measureList = list(range(0,16))
    c = ClassicalRegister(len(measureList))
    qc.add_register(c)
    qc.measure(measureList,c)
    print('here')
    backend = Aer.get_backend('qasm_simulator')
    job = backend.run(qc,shots=1)
    results = job.result()
    counts = results.get_counts(qc)
    print(counts)
    return [counts,measureList]
        
    
#runs at the end of the game when a certain number of turns have occured

        
def endGame(qc):
    counts,measureList = endMeasure(qc)
    print(measureList)
    result = list(counts.keys())[0]
    print(result)
    aliceSquares = []
    bobSquares = []
    probabilities = []
    result = result[::-1]
    for i in range(len(result)):
        print(i)
        print(15-i)
        print(len(result))
        if result[i]=='0':
            aliceSquares.append(i)
            probabilities.append([i,0,1])
        elif result[i]=='1':
            bobSquares.append(i)
            probabilities.append([i,1,0])
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
    return probabilities

if __name__ == "__mainy__":
    qc = QuantumCircuit(16,16)
    state = initialize(qc)
    backend = Aer.get_backend('qasm_simulator')
    aliceSquares = [0]
    bobSquares = [15]  
    #singleMeasure(qc,1)
    print("")
    gate(qc,[1],"H",state[0])
    print(probabilities(state[0]))
    endGame(qc)