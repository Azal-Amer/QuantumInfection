
function interpolateColor(color1, color2, factor) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  }
  
  // Main color mapping function
export function getColorForProbability(probability, color1, color2, prob1, prob2) {
    // probability is the probability of the state being zero, color1 is the color you'd map to on one end, color 2 is the 
    // probability on the other, and prob1 and prob2 are the threshholds to trigger hitting the maxima

    // Ensure probability is within bounds
    probability = Math.max(Math.min(probability, 1), 0);
    
    // Normalize the probability to the given range
    const normalizedProb = (probability - prob1) / (prob2 - prob1);
    
    // Interpolate between the two colors
    const interpolated = interpolateColor(color1, color2, normalizedProb);
    
    // Convert to hex
    return '#' + interpolated.map(x => x.toString(16).padStart(2, '0')).join('');
  }
//   Above functions were written by Claude 3.5 Sonnet

export class Space {
    constructor(x, y,zeroProb = .5,oneProb = .5 ,state = '+') {
        this.x = x;
        this.y = y;
        this.zeroProb = zeroProb;
        this.oneProb = oneProb;
        this.state = state;
        this.color = getColorForProbability(this.zeroProb, [0, 0, 255], [255,0,0], 0, 1);
        this.gates = ["I"];
    }
    updateState() {
        this.color = getColorForProbability(this.zeroProb, [0, 0, 255], [255,0,0], 0, 1);
    }
   
}
export class BoardSpaces {
    constructor(size) {
        this.size = size;
        this.spaces = this.createSpaces();

    }
    createSpaces() {
        let spaces = [];
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(new Space(i, j));
            }
            spaces.push(row);
        }
        return spaces;
    }
    accessSpace(x,y){
        return this.spaces[x][y];
    }
}
// export default BoardSpaces,space;
