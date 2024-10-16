from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import Aer
import numpy as np

def qubit_from_square(column,row):
   return 6*row+column-1

def square_from_qubit(qubit):
    return ((qubit+1)%6-1, (qubit)//6)

def initialize(qc):
    for i in [1,2,3,5,6,8,9,11,12,13,15,18,19,21,25,28,31]:
        qc.h(i)
    for i in [4,7,10,14,16,17,20,22,23,24,26,27,29,30,32,33,34]:
        qc.x(i)
        qc.h(i)
    qc.x(35)

def singleQubitOp(qc, qubit, op):
    turn +=1
    if op == "H":
        qc.h(qubit)
    elif op == "X":
        qc.x(qubit)
    elif op == "Z":
        qc.z(qubit)
    elif op == "S":
        qc.s(qubit)
    else:
        print("Invalid operation")

def twoQubitOp(qc,qubit1,qubit2,op):
    turn +=1
    if op == "CNOT":
        #controlling on qubit1, target on qubit2
        qc.cx(qubit1,qubit2)
    elif op == "SWAP":
        qc.swap(qubit1,qubit2)
    elif op == "CZ":
        qc.cz(qubit1,qubit2)
    else:
        print("Invalid operation")

def singleMeasure(qc,qubit):
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

def endMeasure(qc):
    measureList = []
    for i in range(36):
        if i not in aliceSquares and i not in bobSquares:
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
    qc = QuantumCircuit(36,36)
    initialize(qc)
    backend = Aer.get_backend('qasm_simulator')
    aliceSquares = [0]
    bobSquares = [35]
    aliceTurn = True
    turn = 0

    print("Hi")
    singleMeasure(qc,5)
    if turn>=0:
        endGame(qc)

