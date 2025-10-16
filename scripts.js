let nextPlayer = 'X'; // takes a value of either 'X' or 'O' according to the game turns

//initalize the game by setting the value inside next-lbl to nextPlayer
document.getElementById('next-lbl').innerText = nextPlayer;
//hint: you could use innerText for this 

//This call will create the buttons needed for the gameboard.
createGameBoard()

function createGameBoard()
{
    // Programatically add a button with square brackets enclosing an empty space to each cell in the gameboard
   let cells = document.querySelectorAll('#gameboard td');

   for (let i = 0; i < cells.length; i++){
        let btn = document.createElement('button')

        //square brakcet text
        btn.innerText = '[]';

        cells[i].append(btn);
   }

    // Programatically add 'takeCell' as an event listener to all the buttons on the board
    let btns = document.querySelectorAll('button');
    

    for (let i=0; i<btns.length; i++)
    {
        btns[i].addEventListener('click',takeCell)

        /*
            Assign an event listener to each of the buttons in btns.
            The event to listen for should be 'click'. You will need to pass 
            the event to takeCell. Review the slides for the trick on how to ]
            pass a parameter.
        */
    }
}

// This function will be used to respond to a click event on any of the board buttons.
function takeCell(event)
{

    const btn = event.target;
    // Make sure the button is clickable only once (I didn't mention how to do that, look it up :) )
    if(btn.disabled) return;


    /*
        When the button is clicked, the space inside its square brackets is replaced by the value in the nextPlayer before switching it
    */
   btn.innerText = '[' + nextPlayer + ']';
   if(nextPlayer === 'X') nextPlayer = 'O'; 
   else if(nextPlayer === 'O') nextPlayer = 'X';
   btn.disabled = true;

   document.getElementById('next-lbl').innerText = nextPlayer;
    

    // Check if the game is over
    if (isGameOver())
    {
        // let the label with the id 'game-over-lbl' display the words 'Game Over' inside <h1> element
        document.getElementById('game-over-lbl').innerText = 'Game Over';
    }

    // I'll leave declaring the winner for your intrinsic motivation, it's not required for this assignment 
}

function isGameOver()
{
    // This function returns true if all the buttons are disabled and false otherwise 
    const btns = document.querySelectorAll('#gameboard button');
    for(let i = 0; i < btns.length; i++){
        if(!btns[i].disabled) return false;
    }
    return true;
}
