var pipes = document.getElementById("pipes");
var hole = document.getElementById("hole");
var character = document.getElementById("character");
var scoreOutput = document.getElementById("score");
var text = document.getElementById("text");
var score = 0;
var jumping = false; //will be used as a flag to signify 'jumping' or not
var startInterval;
var jumpInterval;
var jumpFrame = 0;
var gravFrame = 0;
var prevJumpCharTop = 0;
var prevGravCharTop = 250; //50% of #game.width
var gameState = 0; //0 === starting screen, 1 === game running, 2 === game over screen


function easeInQuad (t, b, c, d) {
    return c * (t /= d) * t + b;
}

function easeOutCubic (t, b, c, d) {
    //console.log("function ran");
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

//disable the default animation in css when first load
pipes.style.animation = "none";
hole.style.animation = "none";

function jump(){
    let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));

    //if it is currently jumping, clear the previous Interval, and the next jumpInterval will be made
    //allows to jump while jump animation is not done. clearInterval clears the previous jump information, frame=0 resets the jump animation
    if(jumping) {clearInterval(jumpInterval); jumpFrame = 0;}

    //set jumping flag as true
    jumping = true;

    //setInterval in 60fps (updates 1000/60ms once)
    jumpInterval = setInterval(() => {
        //when animation first starts (frame == 0), use characterTop as jump 'starting point'
        //after frame > 0, use prevCharTop as jump 'starting point'
        if (jumpFrame == 0) {
            character.style.top = easeOutCubic(jumpFrame/60, characterTop, -70, 0.3) + "px";
            prevJumpCharTop = characterTop;
        } else {
            character.style.top = easeOutCubic(jumpFrame/60, prevJumpCharTop, -70, 0.3) + "px";
        }

        //increments the frame, so easeOutCubic can return a different value
        jumpFrame++;

        //stop jumping after animation is done (length of jump = 20 frames)
        if (jumpFrame >= 20) {
            //set jumping flag to false
            jumping = false;
            //stop the jumpInterval (stopping the jumping animation)
            clearInterval(jumpInterval);
            //resets the frame to 0
            jumpFrame = 0;
        }
    }, 1000/60);
}

//function attached to hole.addEventListener. not () => {} because need to removeEventListener, when restarting a new game
function animationIteration(){
    // we want hole.style.top range from -450 until -200
    // this is so that the hole is always inbetween the pipes (visually)
    let random = -(Math.random()*250 + 200);
    hole.style.top = random + "px";
    //increment the score after the character has passed the hole, aka new pipes animation iterates
    score++;
    scoreOutput.innerHTML = score;
}

function startGame() {
    //if game is running, run jump();
    if (gameState === 1) {
        jump();
    } else 
        //if game is in starting screen,
    if (gameState === 0){
        //set game to state 1, to signal it's starting to run
        gameState = 1;
        //RESET TO NEW GAME SETTINGS
        score = 0;
        gravFrame = 0;
        prevGravCharTop = 250;
        //clear the board
        text.innerHTML = "";
        //start the animation
        pipes.style.animation = "";
        hole.style.animation = "";
        // addEventListener to #hole, so an anonymous function will be triggered to randomize the position of #hole
        hole.addEventListener('animationiteration', animationIteration);

        //GRAVITY FUNCTION PART OF THE CODE
        startInterval = setInterval(() => {
            // get the value of the 'top' property of the character
            let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));

            //if currently not jumping
            if (jumping === false)
                //set new character style top value. adding the top value will move the element down => 'gravity'
                //use prevGravCharTop as 'a point where the char starts falling'
            {
                character.style.top = easeInQuad(gravFrame/60, prevGravCharTop, 500, 1.15) + "px";
                //increments gravFrame to continue animation. easeInQuad will return diff values everytime setInterval is run
                gravFrame++;
            }
            //when it's jumping, set the prevGravCharTop to the most updated position of the char, characterTop.
            //resets the gravity animation, gravFrame = 0;
            else {
                prevGravCharTop = characterTop;
                gravFrame = 0;
            }
            

            //HIT DETECTION PART OF THE CODE
            let pipesLeft = parseInt(window.getComputedStyle(pipes).getPropertyValue("left"));
            let holeTop = parseInt(window.getComputedStyle(hole).getPropertyValue("top"));
            let cTop = -(500-characterTop);

            //if character 'hits' the bottom of game div, go to gameState 2
            //OR
            //if character 'hits' the pipes, go to gameState 2
            //if pipes.left < char.width AND pipes.left < -pipes.width+char.width AND (cTop is taller than holeTop OR cTop is shorter than lowerHoleTop-char.height)
            if( (characterTop >= 470) || ( (pipesLeft < 50) && (pipesLeft > -20) && ( (cTop < holeTop) || (cTop > holeTop + 150 - 30) ) ) ) {
                pipes.style.animation = "none";//stops the animation
                hole.style.animation = "none";//stops the animation
                
                text.innerHTML = "GAME OVER <br><br>TRY AGAIN?";
                //disables fadingAnimation
                text.style.animation = "none";
                //sets gameState = 2;
                gameState = 2;
            }
        }, 1000/60);
        jump(); //jump new game is starting
    } else {
        //if gameState = 2, and startGame() is invoked:
        //set to main screen settings
        text.innerHTML = "CLICK<br>OR<br>SPACEBAR<br>TO START";
        text.style.animation = "";
        //RESET TO DEFAULT SETTINGS
        //resets the position of the character, and score
        score = 0;
        scoreOutput.innerHTML = score;
        character.style.top = "50%";//resets the char position
        gravFrame = 0; //resets the gravity
        clearInterval(jumpInterval);
        jumping = false;
        prevGravCharTop = 250;
        jumpFrame = 0;
        clearInterval(startInterval);
        hole.removeEventListener('animationiteration', animationIteration);
        //sets gameState = 0;
        gameState = 0;
    }
}

//adds spacebar as starting game/jump control
document.body.onkeydown = (e) => { if(e.keyCode === 32) startGame();};

//adds 'click' inside of #game to starGame/jump
document.getElementById("game").addEventListener("click", startGame);
