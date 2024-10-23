
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
        this.gates = [];
        
    }
    updateState() {
        this.color = getColorForProbability(this.zeroProb, [0, 0, 255], [255,0,0], 0, 1);
    }
   
}
export class BoardSpaces {
    constructor(size) {
        this.size = size;
        this.spaces = this.createSpaces();
        this.locked = false;
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
        // if(x < 0 || x >= this.size-1 || y < 0 || y >= this.size-1){
        //     console.log("Invalid space access");
        // }
        return this.spaces[x][y];
    }
    updateProbabilities(probabilities){
        // Once the game ends, we should prevent any probabilities from being updated
        if(this.locked==false){
            console.log("Updating probabilities",probabilities);
        // Update the probabilities of each space
        // probabilities is a 1d array, size*size long, want to update the zeroProb and oneProb of each space 
        // in the board
        for(let i = 0; i < this.size; i++){
            for(let j = 0; j < this.size; j++){
                const index = i*this.size + j;

                this.spaces[i][j].zeroProb = parseFloat(probabilities[index][1].toFixed(3));
                // console.log(probabilities[index][1],probabilities[index][2]);
                this.spaces[i][j].oneProb =  parseFloat(probabilities[index][2].toFixed(3));
                
            }
            
        }
        this.update();
        }
        
    }
    findWinner(){
        // We want to go through each space, and then if the zeroState has a higher probability, it won the space, 
        // if the oneState has a higher probability, it won the space
        let zeroWins = 0;
        let oneWins = 0;
        for(let i = 0; i < this.size; i++){
            for(let j = 0; j < this.size; j++){
                if(this.spaces[i][j].zeroProb > this.spaces[i][j].oneProb){
                    zeroWins++;
                } else {
                    oneWins++;
                }
            }
        }
        console.log("Zero wins:",zeroWins,"One wins:",oneWins);
        if(zeroWins > oneWins){
            return 0;
        } 
        else if(oneWins > zeroWins){
            return 1;
        }
        else{
            return -1;
        }
    }
    update(){
        for(let i = 0; i < this.size; i++){
            for(let j = 0; j < this.size; j++){
                this.spaces[i][j].updateState();
            }
        }
    }
    clone(){
        const clone = new BoardSpaces(this.size);
        clone.spaces = this.spaces.map(row => row.map(space => {
        const newSpace = new Space(space.x, space.y, space.zeroProb, space.oneProb, space.state);
        newSpace.color = space.color;
        newSpace.gates = space.gates.map(gate => gate.clone());
        return newSpace;
        }));
        clone.locked = this.locked;
        return clone;
        
        

       
    }
}

// export default BoardSpaces,space;
