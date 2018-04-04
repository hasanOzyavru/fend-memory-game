/*
 * Create a list that holds all of your cards
 */
const cardsIToArray = [...document.querySelectorAll('.card .fa')];
/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
let cardsIShuffled = shuffle(cardsIToArray);
const fragment = document.createDocumentFragment();
for (let j = 0; j < cardsIShuffled.length; j++) {
    const iTag = document.createElement('i');
    iTag.className = cardsIShuffled[j].className;
    const listTag = document.createElement('li');
    listTag.className = 'card';
    listTag.appendChild(iTag);
    fragment.appendChild(listTag);
}
const cardsDeck = document.querySelector('.deck');
cardsDeck.innerHTML = '';
cardsDeck.appendChild(fragment);
// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {

    var currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
let arrayOpenCards = []; //items of the array are clicked elements, length is 0,1 or 2
let chkIfArrayResetted = true; //set it to false to prevent reaction to the clicks prior to array reset
let numberOfMoves = 0; // every turn that 2 cards shown is considered as 1 move
const scoreMoveDisplay = document.querySelector('.moves'); // move counter is displayed in '.moves' class
scoreMoveDisplay.textContent = numberOfMoves; // initially displays 0;
let successCounter = 0; // target is to find 8 pairs.
let startTime = 0; // the parameters are for calculating total duration to win.
let endTime = 0;
let firstClick = true; // startTime is calculated based on firstClick and timer starts.
let timeStarts; // used as interval timer to display running time
let timerD = 0;
// Display the running time
const timeDisplay = document.querySelector('.duration');
function clockFunction () {
    timerD += 0.1;
    timeDisplay.textContent = '   ' + timerD.toFixed(1) + ' secs.';    
}
const star1 = 18; //after 20 moves, only one star left
const star2 = 12; //after 15 moves, 2 stars left
const star = document.querySelector('.stars');

const endOfGame = 8; // 8 pair match is the end of the game
const needConcentration = 24; //24 move or more requires more concentration

// Event listener for card click
cardsDeck.addEventListener('click', function(e) {

    // ensure that action is taken when "not shown" cards are clicked
    if (e.target.classList.contains('card') && e.target.className != 'card open show') {
        // time starts at first click and not reinitialized again by means of this block
        if (firstClick) {
            startTime = performance.now(); // duration start to be used in calculation for duration
            timeStarts = setInterval(clockFunction,100); // time display with 0.1 sec intervals
            firstClick = false; // Only at first click this block runs
        }
        // only if there are less than 2 cards shown, then a new card can be shown
        if (arrayOpenCards.length<2) {
            displaySymbol(e.target, 'card open show');
            arrayOpenCards = addToArray(arrayOpenCards,e.target);
        }
        // when 2 items in the array and while no more clicks are accepted
        if (arrayOpenCards.length===2 && chkIfArrayResetted) {
            numberOfMoves = scoreMove(numberOfMoves); // increment and display the number of moves
            // depending on number of moves star rating decreases
            if (numberOfMoves === star2 || numberOfMoves === star1) {
                star.removeChild(star.firstElementChild);
            }
            // if the 2 cards have the same i tag info
            if (arrayOpenCards[0].firstChild.className === arrayOpenCards[1].firstChild.className) {
                arrayOpenCards = cardsMatch (arrayOpenCards);
                successCounter += 1;
                if (successCounter === endOfGame) {
                    endTime = performance.now();
                    clearInterval(timeStarts);
                    timeDisplay.textContent ='';
                    let timeDuration = (endTime - startTime)/1000;
                    timeDuration = timeDuration.toFixed(1);
                    displayResult (numberOfMoves,timeDuration,star.children.length);
                    const inviteAgain = document.querySelector('.invite');
                    inviteAgain.textContent = 'Want to play again =>';
                    inviteAgain.className = 'invite-visible';
                }
            }else {
                chkIfArrayResetted = false; // wait for array items to be cleared, before new click reaction
                setTimeout(cardsDoNotMatch, 1000); // let player to see cards for 1 sec with reacting to new click 
            }

        }

    }  
});
/* displaySymbol function shows the clicked card by changing its classList.
Class styles are defined in app.css
@param target = clicked element
@param status = classList
*/
function displaySymbol(target,status){
    target.className = status;
}

/* addToArray function adds the clicked card to the array as long as it has 
length less than 2. This array can be empty or has 1 or 2 items.
@param array = list of target elements i tags, clicked
@param target = clicked element
@return array = array after item is added
*/
function addToArray(array,target) {
    array.push(target);
    return array;
}

/* cardsMatch function locks the 2 same cards in match position
empty and return the array.
@param array = array with 2 similar cards
@return array = empty array
*/
function cardsMatch(array) {
    array[0].className = 'card match';
    array[1].className = 'card match';
    array = [];
    return array;
}

/* cardsDoNotMatch function keeps 2 not similar cards open for 1 sec and then the symbols
are hidden, but cards stay in open status.
no parameter is given because it is in setTimeOut function instead arrayOpenCards scope is
kept global.
*/
function cardsDoNotMatch () {
    arrayOpenCards[0].className = 'card open'; // to show card was open at least once
    arrayOpenCards[1].className = 'card open';
    arrayOpenCards = [];
    chkIfArrayResetted = true; // emptying the array, it is OK to accept new click
}

/* scoreMove function gets and increments the number of moves. Update the display
@param number = initial number of move
@return number = number of move incremented by 1
*/
function scoreMove(number) {
    number += 1;
    scoreMoveDisplay.textContent = number;
    return number;
}
/* displayResult shows the result of the game when completed
@param numberOfMoves = total number of moves during the game
@param time = time elapsed during the game
*/
function displayResult(numberOfMoves, time, numberOfStars) {
    const declareResult = document.querySelector('.result');
    declareResult.className = 'result animation-result';
    if (numberOfMoves < needConcentration) {
        declareResult.textContent = `CONGRATULATIONS! 
	    COMPLETED IN ${numberOfMoves} MOVES FOR ${time} SECONDS.  
	    RESULT : ${numberOfStars} STARS`;
	}else{
	declareResult.textContent = `YOU CAN DO BETTER WITH MORE CONCENTRATION`; 	
    }
}

const restartGame = document.querySelector('.restart');
restartGame.addEventListener('click', function(){
    document.location.href = '';
});