export class Gate {
    constructor(type, qty, label, color,initialPos, size, numQubits,description) {
      this.type = type;
      this.qty = qty;
      this.label = label;
      this.color = color;
      this.x = initialPos[0];
      this.y = initialPos[1];
      this.size = size;
      this.numQubits = numQubits;
      this.qubits = [];
      this.description = description;
    }

  
    drawGate(ctx) {
      ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      
      ctx.fillStyle = 'black';
      ctx.font = `${this.size / 3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.type, this.x + this.size / 2, this.y + this.size / 2);
    }
    updateGate(){
      // for each qubit in the label, add it as _(x,y) to the label
      this.label = this.type;
      if(this.numQubits>1){
        // We dont need a gate label if there is only one qubit
        this.label+='_{'
        this.qubits.forEach(qubit => {
          this.label += `(${qubit.x}, ${qubit.y}),`;
          // if this is the last qubit, remove the comma
          if (qubit === this.qubits[this.qubits.length - 1]) {
            this.label = this.label.slice(0, -1);
          }
        });
        this.label += '}';
        console.log('Updated label:', this.label);
      }
      
    }
    clone() {
      return new Gate(
        this.type,
        this.qty,
        this.label,
        [...this.color],
        [this.x, this.y],  // initialPos
        this.size,
        this.numQubits,
        this.description
      );
    }
  }
  // I don't think I need a multiqubit gate
