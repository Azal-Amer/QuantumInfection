from qiskit import QuantumCircuit
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



def gate(qc, qubit, op, state):
    #create ancilla quantum circuit to evolve the statevector on each turn
    ancqc = QuantumCircuit(16)
    if op == "H":
        state = Statevector.from_label('0'*16)
        qc.h(qubit[0])
        state = state.evolve(qc)

        #print("H gate applied")
    elif op == "X":
        qc.x(qubit[0])
        ancqc.x(qubit[0])
        state = state.evolve(ancqc)
        #print("X gate applied")
    elif op == "Z":
        qc.z(qubit[0])
        ancqc.z(qubit[0])
        state = state.evolve(ancqc)
    elif op == "S":
        qc.s(qubit[0])
        ancqc.s(qubit[0])
        state = state.evolve(ancqc)
    elif op == "CNOT":
        #controlling on qubit[0], target on qubit[1]
        qc.cx(qubit[0],qubit[1])
        ancqc.cx(qubit[0],qubit[1])
        state = state.evolve(ancqc)
    elif op == "SWAP":
        qc.swap(qubit[0],qubit[1])
        ancqc.swap(qubit[0],qubit[1])
        state = state.evolve(ancqc)
    elif op == "CZ":
        qc.cz(qubit[0],qubit[1])
        ancqc.cz(qubit[0],qubit[1])
        state = state.evolve(ancqc)
    else:
        print("Invalid operation")
    return [state,probabilities(state)]
#include return of probabilities of each outcome

def probabilities(state):
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
    measureList = list(range(1,15))
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
        if result[15-i]=='0':
            aliceSquares.append(i)
        elif result[15-i]=='1':
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
    state = initialize(qc)
    backend = Aer.get_backend('qasm_simulator')
    aliceSquares = [0]
    bobSquares = [15]  
    #singleMeasure(qc,1)
    print("")
    gate(qc,[1],"H",state[0])
    print(probabilities(state[0]))
    endGame(qc)