# Quantum Infection Game

A quantum computing game where players compete to control quantum states on a board using quantum gates.

## Quick Start (Pre-compiled Version)

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Install the required Python packages:
```bash
pip install flask flask-cors qiskit qiskit-aer
```

2. Clone or download this repository

### Running the Game

1. Navigate to the project's python directory:
```bash
cd python
```

2. Start the server:
```bash
python webserver.py
```

3. Open your web browser and go to:
- http://localhost:5000
  or
- http://127.0.0.1:5000

The game should now be running in your browser!

## How to Play

1. The game is played between two players: Alice and Bob
2. Players take turns applying quantum gates to the board
3. Each player starts with:
   - 10 Hadamard (H) gates
   - 10 CNOT gates
   - Unlimited X, Y, Z, S, and T gates
4. The game ends after 20 rounds
5. The player with the highest probability of measuring their state wins!

## Troubleshooting

If you encounter issues:
1. Make sure all Python packages are installed correctly
2. Check that port 5000 is not being used by another application
3. Try accessing the game using both localhost and 127.0.0.1
4. Make sure you're running Python 3.7 or higher

## Development Notes

For developers who want to modify the source code:
- The React source code is in `website/quantum_infection/`
- The Python backend code is in the `python/` directory
- The quantum logic is handled by Qiskit
- Link to github [here](https://github.com/Azal-Amer/QuantumInfection)

## License

