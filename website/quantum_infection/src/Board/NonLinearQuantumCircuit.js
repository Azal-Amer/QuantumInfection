var math = require("mathjs");

export class NonLinearQuantumCircuit extends window.QuantumCircuit {
    constructor() {
        super();
        // Store our custom non-linear gate definitions
        this.nonLinearGates = new Map();
    }

    /**
     * This is the function that will allow me to add custom-defined non-linear gates
     * @param name is the name of our new nonLinearGate,
     *  and how it will be called
     * @param transformFunction is anyu function which operates on our state. 
     * As of this version, it's conditional on acting toward the 1 state.
     */
    addNonLinearGateType(name, transformFunction) {
        // Add the gate definition to basic gates
        this.basicGates[name] = {
            name: name,
            params: [],
            qubits: 1,
            matrix: [[1, 0], [0, 1]]  // Placeholder matrix
        };
        
        // Store the transformation function
        this.nonLinearGates.set(name, transformFunction);
    }
    

    // Override applyGate to handle non-linear gates
    applyGate(gateName, column, wires, options) {
        // Check if this is one of our non-linear gates
        if (this.nonLinearGates.has(gateName)) {
            this.applyNonLinearGate(gateName, wires[0]);
            return;
        }
        // Otherwise, use normal gate application
        super.applyGate(gateName, column, wires, options);
    }

    // Apply a non-linear gate to a specific wire
    applyNonLinearGate(gateName, wire) {
        const transformFunction = this.nonLinearGates.get(gateName);
        const newState = {};
        let newStateBits = 0;
        // First, calculate the probability of the wire being in |1⟩
        // This can be useful for basic non-linear gates
        let wireOneProbability = 0;
        for (let stateStr in this.state) {
            const stateInt = parseInt(stateStr);
            if (stateInt & (1 << wire)) {
                const state = this.state[stateStr];
                wireOneProbability += math.pow(math.abs(state), 2);
            }
        }
        
        // Now apply the transformation
        for (let stateStr in this.state) {
            const state = this.state[stateStr];
            const stateInt = parseInt(stateStr);
            
            if (stateInt & (1 << wire)) {
                /* Credit Claude 3.5 sonnet for the clever
                 Above check. Essentially this just checks if
                 Any of our bits are set to 1*/
                const newValue = transformFunction(state, wireOneProbability);
                newState[stateStr] = newValue;
            } else {
                // Wire is |0⟩, leave unchanged
                newState[stateStr] = math.complex(state.re, state.im);
            }
            
            newStateBits |= stateInt;
        }
        
        // Handle empty state
        if (this.stateBits == 0 && Object.keys(this.state).length == 0) {
            newState["0"] = math.complex(1, 0);
        }
        
        this.state = newState;
        this.stateBits = newStateBits;
    }
}
