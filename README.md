---
tags: []
---
# Overview


> [!Todo] Title
> - [ ] Write barebones server for Ayden to access and see if his code is working

# Notes

## Rules
Board starts with the (1,1) as 0 and (6,6) as 1. All other squares start in a checker pattern of +/- states.

- Each turn, a player applies either a 1 or 2 qubit operation (or measures a qubit). You can only apply 1 qubit operations on qubits that are adjacent to squares that are yours (not in superposition) Two qubit operations can occur between any two adjacent qubits, but one has to be adjacent to a definite states
    - 1 qubit gates: H,X,Z,S
        - 2 qubit gates: CNOT, SWAP, CZ
            - Once a square is measured, it stays in that state until the end of the game
                - Game ends after 50 turns (tweak) or until all states are measured.
                    - Potential twist: certain parts of the board are given score multipliers for extra strategy

| <br>![initial board checkering](assets/Starting%20Board.jpg)<br> |
| ---------------------------------------------------------------- |
| Initial Board Checkering                                         |


## Code Styling

- Any functions used, must take the cell(s) acted on and the move, and return the probabilities of being in the $\ket{0},\ket{1}$ state, along with the cell associated.



| ![Image Description](assets/Server%20Diagram.jpg) |
| ------------------------------------------------- |
| Diagram of the overall setup                      |



## Server Notes
Working on designing the interface, I'll use react

We have a few things we want to get working, 

> [!Todo] Roadmap
> - [x] Make baseline functions and react stuff
> - [x] Design grid react objects
> - [ ] Design object classes
> - [ ] Come up with the API calls and ports


> [!Alert] Requirements
> - Nodejs

TO RUN, enter the commands while open in the main directory in VSCode
```
cd ./website/quantum_infection
npm run start
```
Make sure you have node installed
### Object Classes

#### - [ ] Board and Spaces
The board has two functions, 
- constructor: Takes the size of the board and populates with spaces
- A getter: Will enable people to access spaces from the board
![writeup of what coordinate points take the initialboard](assets/Grid%20Size%20Spaces.png)


The spaces have two functions, and several properties
- Properties
	- Probabilities - Allow us to manipulate the color, and are found from the state (NOTE that when later we rip out the IBM stuff, we need to ensure we are working in the 2-norm)
- Color
	- The color is derived from a colormap

Right now I'm trying to handle gate logic. My suspicions from the debug logs are saying that for some reason, adding different gates is not preserved, something is resetting the board. 
Also, I resized the board.
C
## Python Notes

