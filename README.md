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

#### Board and Spaces
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

Update for today, is that the effect classes don't have direct modifying perms, you need to use setters and getters. Right now, I want to find a way to display the information about the board on the side in the main context, so I'm using a large-scope variable of `boardInfo`. 
Next time, make it so that there's a hover and a clicked info, then remove it from the bottom.
Also, add some more styling to the gate palate. Then add the control gates, with fixed quantities.
#### Gates
The gate class is currently a WIP, FUTURE AZAL PLEASE WRITE THIS OUT

### Oct 16th
Goal for today, is to implement multi-controlled gates, and design their visuals. Additionally, it would be great if I could start wiring into the python code for Ayden to build a test environment with. 
- Will eventually need to make an error/alert asset which sticks at the top, and is an inherited setter or getter
Probably for the best that I design it as a visual first, though. To do that, the active-gate needs to stay the active gate for a moment, and I need to allow for multi-controlled properties.

**Gameplan**
- Go through code, and refactor logic to be compatible with multiple controlled gates
	- Should be compatible with two gates being applied at once. Added a `numQubits` property to the gates, so now it stays active for as long as that is true.
	- I think I should set activeGate itself to be a new instance. That way logic might be easier
		- Just did this, now need to refactor the information display code. That way the spaces can have a list of gate objects, and the display code puts the real string
- Potentially refactor the gate object to also work with multiple inputs.
	- Write logic, so that the gate operation holds information regarding the link .In that case, while we push the object to an array, it should be the same object. (This is native in JS)


> [!Bug] If we're in the middle of selecting spaces for a multiqubit gate, and then click out, then the gate is still applied. I need to add a conditional to that

### Oct 17th 
- [ ] Should probably also make a notification element, so that I can add different arbitrary pieces of information
	- Thinking it takes in a title, a description, and a kind of notice. 
		- 3 Notices : Errors (temporary),
		- Descriptive (number of spaces to click)
		- Debug (any color) 
Inside the gate descriptive modal, tell the user how many more they need to select before it takes place.
A way to visualize what gates are on a cell, could be nice
Also, at the beginning of the game, have a rules tile the player can access

Game-plan on priorities is
- Implement gate-deselect constraint. You can only de-select if the number of gates required has been applied
	- Made it so that while you're placing a gate, you're forced into clicking it down fully, you can't click away, or use the other gates to click away.
	- Could also be nice if the gates that are being multi-applied, are both colored in a box of some color
	- 
- Implement CNOT
	- Once the gate itself is implemented, *make a draw function for it* 
We can make the colormap with two colors as an interval

Implemented an alertbox for the user to engage with! It takes the form of a `useAlert` function run into an alert shower. The alertShower exists in appjs, and simply needs to be imported to use. There are several alert types, which map to different colors. The alerts support inline latex,

Then we can call this in specific contexts, it exists as a react hook.


> [!equation] You're using a BLAHB LAH
> You need to do blah blah 

#### Recap
- Did backend work so that multi-controlled gates could be safely handled, and added adaptively (details above)
- Added an alert/callout system, which hopefully can be developed better as time progresses
- Redid the layout
![](assets/Pasted%20image%2020241017203424.png)

Next time:
- [x] Make the controlNot on each qubit, know what qubits it's attached too
- [x] Render the CNOTs
	- [x] When selecting gates for multi-qubit, it might be nice to keep the previous states in some color. Also, make sure that when hovering on a square, the hover displays what qubits are targetted and controlled. 
- [x] Maybe render the gates themselves
- [ ] Link into Ayden's code

### October 18th
Implemented gate visualizations, rendered CNOTs, and also added UI styling to prevent jittering.

**Next Time**
- [ ] Link to Ayden's Code
- [x] Implement system for fixed number of gates.
	- [x] Add visualization for this
### October 19th
- [x] Implementing quantity of gates
	- Each time a gate is used, and it has a fixed number of possible uses, then if it's the active gate, decrement the global type by 1.
- [x] Write code to initialize main board to the new square quantity, make sure the same occurs in the python
	- [x] The interfacing should occur from the site, into the IBM. That way both of them stay synced for different patterns. For the 4x4, I'm thinking

| $\ket{0}$ | $\ket{+}$ | $\ket{+}$ | $\ket{-}$ |
| --------- | --------- | --------- | --------- |
| $\ket{+}$ | $\ket{-}$ | $\ket{-}$ | $\ket{+}$ |
| $\ket{-}$ | $\ket{+}$ | $\ket{+}$ | $\ket{-}$ |
| $\ket{+}$ | $\ket{-}$ | $\ket{-}$ | $\ket{1}$ |
Form the $\ket{-}$ by $XH$
Form the $\ket{+}$ through $H$

- [x] Write interfacing code 
Guide to setup:
- Install flask on yor python installation, and run the file located at `./python/webserver.py`
- Start the node server, and you should be interfacing. Below are known bugs

> [!Bug] Bugs
> - [x] Tile Updating only on Mouse move
> - [x] Not implemented measurement operator yet
> - [ ] Window resizing is broken

- Second half of the day, I fully integrated with the interfacing code, implemented a round system, and measurement
	- For the round system, I used React's event system to announce that the game had finished. Then the PlayerBoard, which had appropriate board-modification permissions, could initiate the endgame and board locking. 
	- Any access to the board is made using a *queing system* . This is because I encountered an error that meant that on the moment that the endgame was triggered, a gate was applied, and the gate acting on the board overwrote the action of the endgame.

In the python, the endgame methods had much debugging done, but hopefully it's self explanatory. Mostly bug squashing, but also modifying the output to match with the existing API format.
> [!todo] What's left
> - [ ] Implement alternating rounds system
> 	- [ ] Each player has their own number of gates, not from the fixed whole
> - [ ] Add a play-again button
> - [x] Debug the behavior of the API, sometimes the board doesn't initialize properly
> - [ ] Implement SWAP and $C_{z}$ gates

### Oct 22
- Added a listener for the `endgame`  emitted from`Roundrunner`, into `gamePalate`. Now when the game ends, the palate is un-clickable and the board isn't interface-able. 
		- Additionally, modified the`draw()` function of the gate object, so that it now takes `inactive` as a parameter. That way I can deactivate gates visually at will
- Implemented display at endGame, along with a Play again button which resets the board and player states. 
	- Should also declare the winner, not yet implemented
## Python Notes




```run-python
def f(a=4,b=3,c=5,d=1):
	return a+b*c+d
print(f(5,2))
```


$$
\begin{pmatrix}
0 & 1 \\
1 & 0
\end{pmatrix}
$$