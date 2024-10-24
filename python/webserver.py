from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import Aer
import logging
import os
import main  # Import your main.py file

app = Flask(__name__, static_folder='build', static_url_path='')
def get_ip_addresses():
    """Get all available IP addresses where the server can be accessed"""
    addresses = ['localhost', '127.0.0.1']
    try:
        # Get hostname and associated IP address
        hostname = socket.gethostname()
        host_ip = socket.gethostbyname(hostname)
        if host_ip not in addresses:
            addresses.append(host_ip)
        
        # Get all network interfaces
        for interface in socket.getaddrinfo(hostname, None):
            ip = interface[4][0]
            if ip not in addresses and not ip.startswith('fe80:'): # Exclude IPv6 link-local
                addresses.append(ip)
    except:
        pass
    return addresses
# The above just needs to check what localhosts we're able to use and sets it up

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
# Global variables to store game state

logging.basicConfig(level=logging.DEBUG)
quantum_circuit = None
current_state = None
turn_count = 0
measured_qubits = set()


@app.route('/')
def serve():
    print("Serving index.html")
    return send_from_directory(app.static_folder, 'index.html')
# Catch all routes and redirect to index.html for client-side routing
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(os.path.join(app.static_folder, 'static'), path)

# Catch all routes to handle React Router
@app.route('/<path:path>')
def catch_all(path):
    if os.path.isfile(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


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
    port = 5000
    
    # Check if build folder exists
    if not os.path.exists(app.static_folder):
        print(f"\n❌ Error: Build folder not found at {app.static_folder}")
        print("Please ensure the React app build files are in the ./build directory")
        exit(1)
        
    if not os.path.exists(os.path.join(app.static_folder, 'index.html')):
        print("\n❌ Error: index.html not found in build folder")
        print("Please ensure the React app build files are in the ./build directory")
        exit(1)
    
    # Print server information
    print("\n=== Quantum Game Server ===")
    print("Starting server...")
    
    # Get and display all available URLs
    addresses = get_ip_addresses()
    print("\n🌐 The game is available at:")
    for addr in addresses:
        print(f"  http://{addr}:{port}")
    
    print("\n💡 Note: Some addresses might not work depending on your network configuration")
    print("   Try another if one doesn't work.")
    print("\n⌨️  Press Ctrl+C to stop the server")
    print("========================\n")
    
    try:
        # Run the server on all interfaces
        app.run(host='0.0.0.0', port=port, debug=True)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n❌ Error: Port {port} is already in use.")
            print("Please close any other running servers or choose a different port.")
        else:
            print(f"\n❌ Error: {str(e)}")
        exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
        exit(0)