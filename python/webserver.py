from flask import Flask, request, jsonify
from flask_cors import CORS
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import Aer
import logging
import main  # Import your main.py file

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
# Global variables to store game state
logging.basicConfig(level=logging.DEBUG)
quantum_circuit = None
current_state = None
turn_count = 0
measured_qubits = set()

def qubit_from_square(column, row):
    return 4 * row + column

@app.route('/initializeBoard', methods=['POST', 'OPTIONS'])
def initialize_board():
    # reset all the global variables
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    global quantum_circuit, current_state, turn_count, measured_qubits
    quantum_circuit = None
    current_state = None
    turn_count = 0
    measured_qubits = set()
    
    data = request.json
    plus_spaces = data.get('plusSpaces', [])
    minus_spaces = data.get('minusSpaces', [])

    print("Received plus_spaces:", plus_spaces)
    print("Received minus_spaces:", minus_spaces)

    # Create a new 4x4 quantum circuit (16 qubits)
    quantum_circuit = QuantumCircuit(16)
    
    # Initialize all qubits to |0> state
    current_state = Statevector.from_label('0' * 16)

    # Function to safely get x and y from a space
    def get_xy(space):
        if isinstance(space, dict):
            return space.get('x'), space.get('y')
        elif isinstance(space, list) and len(space) >= 2:
            return space[0], space[1]
        else:
            print(f"Unexpected space format: {space}")
            return None, None

    # Apply Hadamard gates to plus_spaces
    for space in plus_spaces:
        x, y = get_xy(space)
        if x is not None and y is not None:
            qubit = qubit_from_square(x, y)
            quantum_circuit.h(qubit)

    # Apply X and then H gates to minus_spaces
    for space in minus_spaces:
        x, y = get_xy(space)
        if x is not None and y is not None:
            qubit = qubit_from_square(x, y)
            quantum_circuit.x(qubit)
            quantum_circuit.h(qubit)
    # Set the corner states
    quantum_circuit.x(15)  # Set (3,3) to |1> state

    # Apply the quantum circuit to the initial state
    current_state = current_state.evolve(quantum_circuit)

    # Reset game state
    turn_count = 0
    measured_qubits = set()


    # Calculate initial probabilities
    probabilities = main.calculate_probabilities(current_state)

    # Print the probabilities
    print("Initial Probabilities:")
    for i, prob_0, prob_1 in probabilities:
        print(f"Qubit {i}: |0> = {prob_0:.4f}, |1> = {prob_1:.4f}")

    quantum_circuit.draw()
    return jsonify({
        "message": "Board initialized successfully",
        "probabilities": probabilities
    }), 200

@app.route('/apply_gate', methods=['POST'])
def apply_gate():
    global quantum_circuit, current_state, turn_count
    data = request.json
    gate_type = data['gate']
    qubits = data['qubits']
    
    print(f"Received request to apply {gate_type} gate to qubits: {qubits}")
    
    # Convert board coordinates to qubit indices
    qubit_indices = [qubit_from_square(q['x'], q['y']) for q in qubits]
    
    try:
        # Apply the gate
        current_state, probabilities = main.gate(quantum_circuit, qubit_indices, gate_type, current_state)
        
        turn_count += 1
        
        # Check for game end conditions
        if turn_count >= 50 or len(measured_qubits) == 16:
            return jsonify({"message": "Game over", "probabilities": probabilities})
        
        return jsonify({"message": "Gate applied successfully", "probabilities": probabilities})
    except Exception as e:
        print(f"Error applying gate: {str(e)}")
        return jsonify({"error": str(e)}), 400
@app.route('/measure_qubit', methods=['POST'])
def measure_qubit():
    global quantum_circuit, current_state, measured_qubits
    data = request.json
    qubit = qubit_from_square(data['x'], data['y'])
    
    if qubit in measured_qubits:
        return jsonify({"error": "Qubit already measured"}), 400

    # Perform the measurement
    ancilla_qc = QuantumCircuit(16, 1)
    ancilla_qc.measure(qubit, 0)
    backend = Aer.get_backend('qasm_simulator')
    job = backend.run(ancilla_qc.compose(quantum_circuit), shots=1)
    result = job.result().get_counts(ancilla_qc).most_frequent()

    # Update the quantum state based on the measurement
    measured_value = int(result)
    new_statevector = Statevector.from_int(measured_value, 2**16)
    current_state = current_state.evolve(new_statevector)

    # Update measured_qubits set
    measured_qubits.add(qubit)

    # Calculate new probabilities
    probabilities = main.probabilities(current_state)

    return jsonify({
        "message": "Qubit measured",
        "result": measured_value,
        "probabilities": probabilities
    }),200

@app.route('/game_status', methods=['GET'])
def game_status():
    global turn_count, measured_qubits
    return jsonify({
        "turn_count": turn_count,
        "measured_qubits": list(measured_qubits),
        "game_over": turn_count >= 50 or len(measured_qubits) == 16
    })

@app.route('/end_game', methods=['POST'])
def end_game():
    global quantum_circuit, current_state, measured_qubits
    print('trying to end game')
    
    # Measure all unmeasured qubits
    probabilities=main.endGame(quantum_circuit)
    print('ended game')

    return jsonify({
        "message": "Game ended",
        "probabilities": probabilities
    }),200

if __name__ == '__main__':
    app.run(debug=True,port = 5000)