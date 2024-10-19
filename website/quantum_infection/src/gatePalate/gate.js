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
      this.originalGate = null;
      this.kind = this.type;
    }

  
    drawGate(ctx) {
      ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      
      ctx.fillStyle = 'black';
      ctx.font = `${this.size / 3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.type, this.x + this.size / 2, this.y + this.size / 2);
      // On the bottom left of the gate, display the qty
      if(this.qty!=null){
        // put a black circle behind the qty
        const qtyPadding = this.size/8
        ctx.beginPath();
        ctx.arc(this.x + qtyPadding, this.y + this.size-qtyPadding, qtyPadding, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = `${this.size / 5}px Arial`;
        
        ctx.fillText(this.qty, this.x + qtyPadding, this.y + this.size-qtyPadding);
      }
      // If the qty is 0, put a grey overlay on the gate
      if(this.qty==0){
        // Put a grey overlay on the gate wiht alpha .5
        ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        // put a slash through the gate
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.stroke();


        

      }
      
    }
    updateGate(){
      // for each qubit in the label, add it as _(x,y) to the label
      this.label = this.type;
      if(this.numQubits>1){
        // We dont need a gate label if there is only one qubit
        this.label+='_{'
        // this.qubits.forEach(qubit => {
        //   this.label += `(${qubit.x}, ${qubit.y}),`;
        //   // if this is the last qubit, remove the comma
        //   if (qubit === this.qubits[this.qubits.length - 1]) {
        //     this.label = this.label.slice(0, -1);
        //   }
        // });
        for (let i =0 ; i <= this.qubits.length - 1; i++) {
          const qubit = this.qubits[i];
          if (i === this.qubits.length - 1) {
              // This is the first (last) qubit, so just add it without a comma
              this.label += `,(${qubit.x},${qubit.y})`;
          } else {
              // For all other qubits, add a comma before
              this.label = `${this.label}(${qubit.x},${qubit.y}) `;
          }
      }
        this.label += '}';
        console.log('Updated label:', this.label);
      }
      
    }
    clone() {
      const clone = new Gate(
        this.type,
        this.qty,
        this.label,
        [...this.color],
        [this.x, this.y],  // initialPos
        this.size,
        this.numQubits,
        this.description
      );
      clone.originalGate = this;
      return clone;
    }
  }
  // I don't think I need a multiqubit gate
