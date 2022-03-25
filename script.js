// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var pattern = []; //Pattern for the button presses
var progress = 0; //What stage/level the player is currently on
var gamePlaying = false; //Boolean for whether the player is in a game or not.
//Sound variables
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0
var guessCounter = 0;
var mistakes = 0;
var counter = 10;
var timer;

function startTimer() {
  console.log("Here");
  timer = setInterval(counterDown, 1000);
  document.getElementById("timer").innerHTML = `Timer: ${counter}`;
}

function counterDown(){
  counter -= 1;
  document.getElementById("timer").innerHTML = `Timer: ${counter}`;
  if (counter <= 0){
    loseGame();
  }
}

function startGame(){
  //initialize game variables
  progress = 0;
  counter = 10;
  gamePlaying = true;
  pattern = randomSequence();
  console.log("Global pattern: " + pattern)
  
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame(){
  //sets game variables to stop state
  clearInterval(timer);
  gamePlaying = false;
  clueHoldTime = 1000;
  mistakes = 0;
  counter = 10;

  
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("mistakeCounter").innerHTML = `Mistakes: 0`;
}

function randomSequence(){
  var randomPattern = []
  for (var i = 0; i < 8; i++){
    randomPattern.push(Math.floor(Math.random() * (6 - 1 + 1) + 1));
  }
  console.log("In function: " + randomPattern)
  return randomPattern
}

//Logic for the users guess while in game
function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  
  if (pattern[guessCounter] == btn){
    //Guess was right
    if (guessCounter == progress){
      if (progress == pattern.length - 1){
        //Win
        winGame();
      }else{
        //Whole Pattern was right
        clearInterval(timer);
        counter = 10;
        progress++;
        clueHoldTime -= 100;
        playClueSequence();
      }
    }else{
      //Need to check next guess in the sequence
      guessCounter++;
    }
  }else{
    //Lose
    if (mistakes != 2){
      //console.log("Mistakes: " + mistakes)
      document.getElementById("dohAudio").play();
      counter = 10;
      clearInterval(timer);
      mistakes++;
      document.getElementById("mistakeCounter").innerHTML = `Mistakes: ${mistakes}`;
      playClueSequence();
    }else{
      clearInterval(timer);
      loseGame();
    }
  }
}



//Lights up a button
function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}

//Clears the button of the lit
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

//Plays a button from the pattern and lights button/plays sound
function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

//Plays the cues for the number of buttons it should play given the progress variable
function playClueSequence(){
  guessCounter = 0;
  context.resume()
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
  }
  setTimeout(startTimer, delay);
}

//If user loses the game
function loseGame(){
  clearInterval(timer);
  stopGame();
  alert("Game Over. You lost.");
}

//If user wins the game!
function winGame(){
  stopGame();
  alert("You won!");
}

// Sound Synthesis Functions
const freqMap = {
  1: 250,
  2: 325,
  3: 400,
  4: 475,
  5: 550,
  6: 625
}

//Plays the sound to correspond to the pattern
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}

//Plays when the USER presses a button
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}

//Stops the music for startTone() and playTone()
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)
