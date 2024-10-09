export class Gate {
    constructor(type, qty, label, color, initialPos, size) {
      this.type = type;
      this.qty = qty;
      this.label = label;
      this.color = color;
      this.x = initialPos[0];
      this.y = initialPos[1];
      this.size = size;
    }
  
    drawGate(ctx) {
      ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      
      ctx.fillStyle = 'black';
      ctx.font = `${this.size / 3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.x + this.size / 2, this.y + this.size / 2);
    }
  }