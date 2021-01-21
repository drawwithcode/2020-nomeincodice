let socket = io();

let mic;
let sum = 0;
let totalscore = 0;
let nextPlanet;
let changedPlanet;
let players = 0;
let id;
let prec_totalscore = 0;
let timer = 0;
let otherX_players;
let otherH_players;

let yRatio;
let xRatio;
let objectsRatio;

let malus = false;

let beginGame = false;

let myOtherPlayers = [];


let infoCollision = 0;
let infoDistance = 0;
let infoButton;
let showInfo = 1;


//---------QUANDO SI CONNETTE MANDA L'ID DEL GIOCATORE LOCALE AL SERVER-----------

socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
  id = socket.id;

  //quando ti connetti mandi il tuo Id agli altri
  socket.emit('idPlayerConnected', socket.id);

}


//----------------PERMESSI IOS--------------

function touchEnded(event) {
  // check that those functions exist // if they exist it means we are //on iOS and we request the permissions
  if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
    DeviceOrientationEvent.requestPermission()
  }
}


//----------RIMUOVE L'OGGETTO DEL PLAYER SCOLLEGATO-----------

socket.on("idPlayerDisconnected", removeIdPlayersDisconnected);

function removeIdPlayersDisconnected(idPlayerDisconnected) {

  for (let p = 0; p < myOtherPlayers.length; p++) {
    if (idPlayerDisconnected === myOtherPlayers[p].getId()) {
      myOtherPlayers.splice(p, 1);
    }
  }

}


//----------RICEVE LISTA ID DEGLI ALTRI GIOCATORI, PER OGNUNO CREA UN OGGETTO DELLA CLASSE--------------

socket.on("idPlayerConnectedBroadcast", createOtherPlayer);

function createOtherPlayer(idOtherPlayer) {

  for (let k = 0; k < idOtherPlayer.length; k++) {

    //non crea un doppione del giocatore locale
    if (idOtherPlayer[k] !== id) {
      let newPlayer = new OtherPlayer(idOtherPlayer[k], -20, -20, false);
      myOtherPlayers.push(newPlayer);

    }

  }

}


//-----------ACQUISISCE INFO DEGLI ALTRI PLAYER E LI ASSEGNA CIASCUNO AD UN ELEMENTO DELLA CLASSE---------

socket.on('micvolume_in', others_micvolume);

function others_micvolume(data) {

  otherX_players = data.x * windowWidth;
  otherH_players = data.h * windowHeight;

  //riceve i dati info_p e li associa agli Id corrispondenti
  for (let i = 0; i < myOtherPlayers.length; i++) {

    if (data.id === myOtherPlayers[i].getId()) {

      myOtherPlayers[i].x = otherX_players;
      myOtherPlayers[i].h = otherH_players;
      myOtherPlayers[i].shield = data.shield;
      myOtherPlayers[i].blinkShield = data.blinkShield;
      // console.log(data.shield);
    }
  }

}


//-------RICEVE QUANTI GIOCATORI SONO CONNESSI-----------

socket.on("players", show_players);

function show_players(n_players) {
  players = n_players;
  console.log("giocatori connessi: " + players);
}



//-----------HIGHSCORE (aggiornato secondo la somma ricevuta dal server)----------

socket.on('highscore', scores);

function scores(infoScore) {
  totalscore = infoScore.highscore;
  nextPlanet = infoScore.next_planet;
  changedPlanet = infoScore.changed_planet;
}


let bonusServer = false;

socket.on('bonus_effect', bonusEffect);

function bonusEffect(bonusValue) {
  console.log("dentro funzione bonusEffect");
  bonusServer = bonusValue;
}



let unlockButtonShield = false;

let buttonCreated = false;

socket.on('id_shield_bonus', giveShieldBonus);

function giveShieldBonus(idPlayerShield) {

  if (idPlayerShield === id && beginGame && !buttonCreated) {

    // console.log("io ho lo scudoo");
    unlockButtonShield = true;
  }

}




let obstacleX = 0;

let obstacles = [];

socket.on('obstacle_x', createObstacle);

function createObstacle(obstacleXServer) {

  obstacleX = obstacleXServer / 1000 * windowWidth;
  let newObstacle = new Obstacles(obstacleX);
  obstacles.push(newObstacle);

}


let xObstacleCollisionProp;

socket.on('collision_obstacle', removeObstacleCollision);

function removeObstacleCollision(xObstacleCollision) {

  xObstacleCollisionProp = xObstacleCollision / 1000 * windowWidth;

  for (let u = 0; u < obstacles.length; u++) {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    if (xObstacleCollisionProp > obstacles[u].x - 0.5 && xObstacleCollisionProp < obstacles[u].x + 0.5) {
      //xObstacleCollisionProp > obstacles[u].x-0.5 && xObstacleCollisionProp < obstacles[u].x+0.5
      //xObstacleCollisionProp === obstacles[u].x
      obstacles.splice(u, 1);
    }
  }

}


let yPlayer;

let starsOne = [];
let numStarsOne = 60; //quante stelle 1 creare

let starsTwo = [];
let numStarsTwo = 25; //quante stelle 2 creare

let starsThree = [];
let numStarsThree = 10; //quante stelle 3 creare

let planet;


function setup() {

  frameRate(60);
  createCanvas(windowWidth, windowHeight);

  //----------AUDIO INPUT, MICROFONO---------

  userStartAudio();
  // Create an Audio input
  mic = new p5.AudioIn();
  // start the Audio Input.  By default, it does not .connect() (to the computer speakers)
  mic.start();

  objectsRatio = windowWidth / 360;

  yPlayer = height; // posizione inizale player (parte in basso)


  textFont("Roboto");


  //----------CREA LE STELLE-----------

  // for (let p = 0; p < numStarsOne; p++) {
  //   let newStarOne = new StarsOne();
  //   starsOne.push(newStarOne);
  // }
  //
  // for (let q = 0; q < numStarsTwo; q++) {
  //   let newStarTwo = new StarsTwo();
  //   starsTwo.push(newStarTwo);
  // }
  //
  // for (let r = 0; r < numStarsThree; r++) {
  //   let newStarThree = new StarsThree();
  //   starsThree.push(newStarThree);
  // }



  for (let p = 0; p < numStarsOne; p++) {
    let newStarOne = new StarsOne();
    starsOne.push(newStarOne);

    if (p < numStarsTwo) {
      let newStarTwo = new StarsTwo();
      starsTwo.push(newStarTwo);
    }

    if (p < numStarsThree) {
      let newStarThree = new StarsThree();
      starsThree.push(newStarThree);
    }

  }


  planet = new Planets();


  //------------------TASTO INFO-------------------------

  push();


  infoButton = createButton("");


  infoButton.style('background-color', 'white');
  infoButton.style('padding', '20px 20px');
  infoButton.position(width - 40, 60);


  infoButton.mousePressed(showInfoFunction);

  pop();

}









let maxVol = 0.1;
let easing = 0.05;
let calibrationButton = true;
let button;
let startCalibration = false;
let varTimeout;

let vel = 0;

let timerBonus = 0;
let checkTimer = 0;
let bonus = false;
let bonusDuration = 0;

let buttonShield;
let shieldBonus;
let sx;
let sy;
let dS;
let varTimeoutShield;
let varBlinkingShield;
let blinkBonusShield = false;
let e = 0;
let f = 0;

let bx;
let by;
let collision = false;
let d;
let freezePosition;




// let collisionTimeout;
let collisionTimer;
let explosion = false;
let b = 12;
let c = 0;


let noisePlanet = 0;
let noiseShield = 0;
let noiseShieldOther = 0;


function draw() {


  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();

  let h = map(vol, 0, maxVol, height, 0);

  let volHighscore = map(vol, 0, maxVol, 0, height);

  h = round(h); //meno numeri dopo la virgola più leggero il codice? forse, boh ci spero
  volHighscore = round(volHighscore);


  //----------EASE PER FLUIDITA' MOVIMENTI-------------

  let targetY = h;
  let dy = targetY - yPlayer;
  yPlayer += dy * easing;


  //----------ROTAZIONE DEL GIROSCOPIO--------------

  const widthX = map(rotationY, -90, 90, 0, width);



  //----------VELOCITA' PER SFONDO PARALLASSE--------

  if (prec_totalscore !== 0) {
    vel = totalscore - prec_totalscore;
  }

  prec_totalscore = totalscore; //tiene in memoria l'highscore precedente per
  //ricavare il cambiamento complessivo di volumi di tutti i giocatori


  if (!bonus) {
    background(0);
  }

  //---------------MAX ALTEZZA GIOCATORE------------


  if (yPlayer < height * 1 / 5) {

    yPlayer = height * 1 / 5;

  }


  //--------------BONUSSSS---------------


  if (beginGame) {

    let checkBonus = 0;

    checkTimer = 0;

    for (let u = 0; u < myOtherPlayers.length; u++) {

      // console.log(myOtherPlayers[u].h);
      // console.log(u);

      if (yPlayer < myOtherPlayers[u].h + height / 5 && yPlayer > myOtherPlayers[u].h - height / 5) {

        checkBonus++;

      } else {
        checkTimer++;
        timerBonus = 0;
      }
    }

    if (checkTimer === 0) {
      timerBonus++;
    }

    //aggiunto che il bonus si prende solo se si sta più di 200 pixel più in alto dal margine in basso della finestra
    if (checkBonus === myOtherPlayers.length && checkBonus != 0 && timerBonus === 30 && yPlayer < (height * 3 / 5)) { //&& yPlayer < (height - 100)
      bonus = true;
      socket.emit('bonus', bonus);
      console.log("dentro condizioni giuste bonus");
      bonus = false;
    }

    if (bonusServer) {

      if (bonusDuration < 15) {
        background(0, 0, 0, 30);
        // vel += 10000 * bonusDuration / 10;
        console.log("dentro vel1");

      } else if (bonusDuration >= 15 && bonusDuration < 45) {
        background(0, 0, 0, 30);
        // vel += 10000;
        console.log("dentro vel2");

      } else if (bonusDuration >= 50 && bonusDuration < 60) {
        background(0, 0, 0, 30);
        // vel += 10000 * (60 - bonusDuration) / 10;
        console.log("dentro vel3");

      } else {
        bonusServer = false;
      }

      bonusDuration++;

    } else {
      bonusDuration = 0;
    }

  }



  //----------DISPLAY STELLE SFONDO PARALLASSE--------

  if (beginGame) {

    for (let p = 0; p < numStarsOne; p++) {
      starsOne[p].display();
      starsOne[p].move();
    }


    for (let q = 0; q < numStarsTwo; q++) {
      starsTwo[q].display();
      starsTwo[q].move();
    }


    for (let r = 0; r < numStarsThree; r++) {
      starsThree[r].display();
      starsThree[r].move();
    }

  }

  //-------------------DISPLAY PIANETA-------------


  if (changedPlanet) {
    planet = new Planets();
  }

  planet.display();
  // planet.move();



  //---------------OSTACOLI E COLLISIONI---------------

  bx = widthX;
  by = yPlayer - 15;

  for (let t = 0; t < obstacles.length; t++) {

    obstacles[t].display();
    obstacles[t].move();


    d = dist(bx, by, obstacles[t].x, obstacles[t].y);

    if (obstacles[t].y > (height + 75 * objectsRatio)) { //se l'ostacolo va sotto lo schermo viene tolto dall'array
      obstacles.splice(t, 1);
    }

    if (d < 25 * objectsRatio && !bonusServer && !collision) {
      console.log("dentro collision 1");
      collision = true;

      let xObstaclesServer = obstacles[t].x / windowWidth * 1000;
      socket.emit('sendXObstacle', xObstaclesServer);

      obstacles.splice(t, 1);
      collisionTimer = frameCount;
      explosion = true;
      freezePosition = yPlayer;

      infoCollision++;

    }
  }


  if (collision && beginGame) {

    if (frameCount > collisionTimer + 35) {

      yPlayer = height - 10;

    } else {
      yPlayer = freezePosition;
    }

    volHighscore = 0;
    // console.log("dentro collisioni 2");
    if (frameCount > collisionTimer + 180) {
      resetCollision();
    }
    // let collisionTimeout = setTimeout(resetCollision, 3000);
  }


  if (bonusServer) {
    obstacles.splice(0, obstacles.length);
  }



  //---------------SCUDO------------------

  if (unlockButtonShield) {

    push();

    if (!buttonShield) {
      buttonShield = createButton("");
      console.log("dentro button shield");
      buttonCreated = true;
    }

    buttonShield.style('border-radius', '50px');
    buttonShield.style('background-color', '#2896FE');
    buttonShield.style('padding', '30px 30px');
    buttonShield.position(40, height - 80);


    buttonShield.mousePressed(startShield);
    buttonShield.show();

    pop();



  }

  // console.log("unlockButtonShield " +unlockButtonShield);

  sx = widthX;
  sy = yPlayer - 10;

  if (frameCount % 5 === 0) {
    e++;
  }




  if (shieldBonus) {

    push();
    noStroke();
    let noiseShieldHalo = noise(noiseShield) * 10;
    noiseShield += 0.1;
    fill(40, 150, 254, 150);

    if (blinkBonusShield && e % 2 === 0) {

    } else {
      ellipse(widthX, yPlayer - 10, (120 + noiseShieldHalo) * objectsRatio);
    }



    pop();

    for (let d = 0; d < obstacles.length; d++) {

      dS = dist(sx, sy, obstacles[d].x, obstacles[d].y);

      if (dS < 75 * objectsRatio && shieldBonus) {
        console.log("dentro collision scudo");

        let xObstaclesServer = obstacles[d].x / windowWidth * 1000;
        socket.emit('sendXObstacle', xObstaclesServer);

        obstacles.splice(d, 1);

      }
    }
  }





  //---------MOSTRA ALTRI GIOCATORI------------

  for (let j = 0; j < myOtherPlayers.length; j++) {
    myOtherPlayers[j].display();
  }



  push();

  textAlign(RIGHT);
  fill("yellow");
  stroke(0);

  text(vel, width - 20, 40);

  text(totalscore, width - 20, 20);

  text(nextPlanet, width - 20, 60);

  // text(windowHeight, width / 2, 450);
  // text(displayHeight, width / 2, 500);

  pop();


  push();
  noStroke();
  fill(148, 241, 255);

  triangle(widthX - 8 * objectsRatio, yPlayer + 33 * objectsRatio, widthX, yPlayer + 60 * objectsRatio + random(1, 25) * objectsRatio, widthX + 8 * objectsRatio, yPlayer + 33 * objectsRatio);

  pop();


  push();
  noStroke();
  fill(224, 213, 195);

  triangle(widthX - 10 * objectsRatio, yPlayer + 33 * objectsRatio, widthX, yPlayer + 18 * objectsRatio, widthX + 10 * objectsRatio, yPlayer + 33 * objectsRatio);

  pop();

  push();
  fill(121, 216, 160);
  noStroke()

  // triangle(widthX - 10 * objectsRatio, yPlayer, widthX, yPlayer - 30 * objectsRatio, widthX + 10 * objectsRatio, yPlayer);

  ellipse(widthX, yPlayer - 10 * objectsRatio, 25 * objectsRatio, 70 * objectsRatio);

  pop();

  push();
  fill(168, 246, 179);
  noStroke()

  ellipse(widthX, yPlayer - 6 * objectsRatio, 20 * objectsRatio, 55 * objectsRatio);

  pop();

  push();
  noStroke();
  fill(32, 135, 113);

  beginShape();
  vertex(widthX + 10 * objectsRatio, yPlayer + 5 * objectsRatio);
  vertex(widthX + 22 * objectsRatio, yPlayer + 10 * objectsRatio);
  vertex(widthX + 18 * objectsRatio, yPlayer + 35 * objectsRatio);
  vertex(widthX + 17 * objectsRatio, yPlayer + 17 * objectsRatio);
  vertex(widthX + 8 * objectsRatio, yPlayer + 13 * objectsRatio);
  endShape();

  beginShape();
  vertex(widthX - 10 * objectsRatio, yPlayer + 5 * objectsRatio);
  vertex(widthX - 22 * objectsRatio, yPlayer + 10 * objectsRatio);
  vertex(widthX - 18 * objectsRatio, yPlayer + 35 * objectsRatio);
  vertex(widthX - 17 * objectsRatio, yPlayer + 17 * objectsRatio);
  vertex(widthX - 8 * objectsRatio, yPlayer + 13 * objectsRatio);
  endShape();

  beginShape();
  vertex(widthX, yPlayer + 2 * objectsRatio);
  vertex(widthX + 3 * objectsRatio, yPlayer + 4 * objectsRatio);
  vertex(widthX + 4 * objectsRatio, yPlayer + 7 * objectsRatio);
  vertex(widthX, yPlayer + 45 * objectsRatio);
  vertex(widthX - 4 * objectsRatio, yPlayer + 7 * objectsRatio);
  vertex(widthX - 3 * objectsRatio, yPlayer + 4 * objectsRatio);
  endShape();


  pop();




  // push();
  // fill("white");
  // noStroke();
  //
  // triangle(widthX - 5 * objectsRatio, yPlayer, widthX, yPlayer + random(1, 15) * objectsRatio, widthX + 5 * objectsRatio, yPlayer);
  //
  // pop();

  if (frameCount % 5 === 0) {
    c++;
  }


  if (explosion && c % 2 === 0) {


    push();
    noStroke();
    fill("red");

    triangle(widthX - 10 * objectsRatio, yPlayer + 33 * objectsRatio, widthX, yPlayer + 18 * objectsRatio, widthX + 10 * objectsRatio, yPlayer + 33 * objectsRatio);

    pop();

    push();
    fill("red");
    noStroke()

    ellipse(widthX, yPlayer - 10 * objectsRatio, 25 * objectsRatio, 70 * objectsRatio);

    pop();

    push();
    fill("red");
    noStroke()

    ellipse(widthX, yPlayer - 6 * objectsRatio, 20 * objectsRatio, 55 * objectsRatio);

    pop();

    push();
    noStroke();
    fill("red");

    beginShape();
    vertex(widthX + 10 * objectsRatio, yPlayer + 5 * objectsRatio);
    vertex(widthX + 22 * objectsRatio, yPlayer + 10 * objectsRatio);
    vertex(widthX + 18 * objectsRatio, yPlayer + 35 * objectsRatio);
    vertex(widthX + 17 * objectsRatio, yPlayer + 17 * objectsRatio);
    vertex(widthX + 8 * objectsRatio, yPlayer + 13 * objectsRatio);
    endShape();

    beginShape();
    vertex(widthX - 10 * objectsRatio, yPlayer + 5 * objectsRatio);
    vertex(widthX - 22 * objectsRatio, yPlayer + 10 * objectsRatio);
    vertex(widthX - 18 * objectsRatio, yPlayer + 35 * objectsRatio);
    vertex(widthX - 17 * objectsRatio, yPlayer + 17 * objectsRatio);
    vertex(widthX - 8 * objectsRatio, yPlayer + 13 * objectsRatio);
    endShape();

    beginShape();
    vertex(widthX, yPlayer + 2 * objectsRatio);
    vertex(widthX + 3 * objectsRatio, yPlayer + 4 * objectsRatio);
    vertex(widthX + 4 * objectsRatio, yPlayer + 7 * objectsRatio);
    vertex(widthX, yPlayer + 45 * objectsRatio);
    vertex(widthX - 4 * objectsRatio, yPlayer + 7 * objectsRatio);
    vertex(widthX - 3 * objectsRatio, yPlayer + 4 * objectsRatio);
    endShape();


    pop();

    b++;

    if (b === 50) {
      b = 0;
      explosion = false;
    }


  }



  //---------------------FINESTRA NOME PIANETA SCOPERTO-------------------


  if (nextPlanet < -400) {

    push();
    rectMode(CENTER);
    noStroke();
    rect(width / 2, height / 2, 100, 100);
    pop();

    obstacles.splice(0, obstacles.length);

  }

  //----------------FINESTRA INFO GIOCATORE----------------


  if (showInfo === -1) {
    push();
    noStroke();
    textAlign(CENTER);
    rect(0, height / 2 - 30, width, 60);
    infoDistance = round(infoDistance);
    text(infoCollision, width / 2, height / 2 - 10);
    text(infoDistance, width / 2, height / 2 + 10);
    pop();
  }



  //--------PARAMETRI PASSATI DEL GIOCATORE AL SERVER----------

  yRatio = yPlayer / windowHeight * 100000;
  yRatio = round(yRatio);
  yRatio = yRatio / 100000;

  xRatio = widthX / windowWidth * 100000;
  xRatio = round(xRatio);
  xRatio = xRatio / 100000;

  volHighscore = volHighscore * 100;
  volHighscore = round(volHighscore);
  volHighscore = volHighscore / 100;



  let info_p = {

    id: id,
    h: yRatio,
    x: xRatio,
    shield: shieldBonus,
    blinkShield: blinkBonusShield,
    vol: volHighscore

  }

  socket.emit('micvolume', info_p);


  infoDistance += volHighscore;


  //------------CALIBRAZIONE MICROFONO----------------


  if (calibrationButton) {

    push();

    fill(40);
    rect(0, 0, width, height);

    if (!button) {
      button = createButton("Calibra Mic");
    }

    button.position(width / 2, height / 2);

    button.mousePressed(calibrationMicrophone);

    pop();

    infoButton.hide();

  }

  if (startCalibration) {
    maxVol = max(maxVol, vol);
    button.remove();
  }


}


function startShield() {

  // console.log("dentro start shield");
  shieldBonus = true;
  buttonShield.hide();
  unlockButtonShield = false;
  varBlinkingShield = setTimeout(blinkingShield, 3000);
  varTimeoutShield = setTimeout(stopShield, 5000);

}

function blinkingShield() {

  blinkBonusShield = true;

}

function stopShield() {

  shieldBonus = false;
  buttonCreated = false;
  blinkBonusShield = false;

}



function resetCollision() {
  collision = false;
  // clearTimeout(collisionTimeout);
}


function calibrationMicrophone() {
  startCalibration = true;
  varTimeout = setTimeout(timerCalibration, 3000);
}

function timerCalibration() {
  startCalibration = false;
  calibrationButton = false;
  beginGame = true;
  infoButton.show();
}



function showInfoFunction() {
  showInfo = showInfo * -1;
}




//-----------CLASSE PER ALTRI GIOCATORI-----------

class OtherPlayer {

  constructor(id, x, h, shield, blinkShield) {
    this.id = id;
    this.x = x;
    this.h = h;
    this.shield = shield;
    this.blinkShield = blinkShield;
    this.smaller = 2 / 3;
  }

  display() {

    push();
    if (frameCount % 5 === 0) {
      f++;
    }

    if (this.shield) {
      noStroke();
      fill(255);
      let noiseShieldHaloOther = noise(noiseShieldOther) * 10;
      noiseShieldOther += 0.1;

      if (this.blinkShield && f % 2 === 0) {} else {
        ellipse(this.x, this.h - 10, (120 + noiseShieldHaloOther) * objectsRatio);
      }
    }

    pop();

    push();
    noStroke();
    fill(230);

    triangle(this.x - 8 * objectsRatio * this.smaller, this.h + 33 * objectsRatio * this.smaller, this.x, this.h + 60 * objectsRatio * this.smaller + random(1, 25) * objectsRatio * this.smaller, this.x + 8 * objectsRatio * this.smaller, this.h + 33 * objectsRatio * this.smaller);

    pop();


    push();
    noStroke();
    fill(255);

    triangle(this.x - 10 * objectsRatio * this.smaller, this.h + 33 * objectsRatio * this.smaller, this.x, this.h + 18 * objectsRatio * this.smaller, this.x + 10 * objectsRatio * this.smaller, this.h + 33 * objectsRatio * this.smaller);

    pop();

    push();
    fill(190);
    noStroke()

    ellipse(this.x, this.h - 10 * objectsRatio * this.smaller, 25 * objectsRatio * this.smaller, 70 * objectsRatio * this.smaller);

    pop();


    push();
    noStroke();
    fill(120);

    beginShape();
    vertex(this.x + 10 * objectsRatio * this.smaller, this.h + 5 * objectsRatio * this.smaller);
    vertex(this.x + 22 * objectsRatio * this.smaller, this.h + 10 * objectsRatio * this.smaller);
    vertex(this.x + 18 * objectsRatio * this.smaller, this.h + 35 * objectsRatio * this.smaller);
    vertex(this.x + 17 * objectsRatio * this.smaller, this.h + 17 * objectsRatio * this.smaller);
    vertex(this.x + 8 * objectsRatio * this.smaller, this.h + 13 * objectsRatio * this.smaller);
    endShape();

    beginShape();
    vertex(this.x - 10 * objectsRatio * this.smaller, this.h + 5 * objectsRatio * this.smaller);
    vertex(this.x - 22 * objectsRatio * this.smaller, this.h + 10 * objectsRatio * this.smaller);
    vertex(this.x - 18 * objectsRatio * this.smaller, this.h + 35 * objectsRatio * this.smaller);
    vertex(this.x - 17 * objectsRatio * this.smaller, this.h + 17 * objectsRatio * this.smaller);
    vertex(this.x - 8 * objectsRatio * this.smaller, this.h + 13 * objectsRatio * this.smaller);
    endShape();

    beginShape();
    vertex(this.x, this.h + 2 * objectsRatio * this.smaller);
    vertex(this.x + 3 * objectsRatio * this.smaller, this.h + 4 * objectsRatio * this.smaller);
    vertex(this.x + 4 * objectsRatio * this.smaller, this.h + 7 * objectsRatio * this.smaller);
    vertex(this.x, this.h + 45 * objectsRatio * this.smaller);
    vertex(this.x - 4 * objectsRatio * this.smaller, this.h + 7 * objectsRatio * this.smaller);
    vertex(this.x - 3 * objectsRatio * this.smaller, this.h + 4 * objectsRatio * this.smaller);
    endShape();


    pop();



  }

  getId() {
    return this.id;
  }

}

//---------------CLASSE OSTACOLI--------------

class Obstacles {

  constructor(obstacleX) {

    this.x = obstacleX;
    this.y = -15;
    this.r = 30 * objectsRatio;
    this.rand1 = random(-4, 4);
    this.rand2 = random(-4, 4);
    this.rand3 = random(-4, 4);
    this.rand4 = random(-4, 4);
    this.rand5 = random(-4, 4);
    this.inside = 2 / 3;
  }

  display() {

    push();
    noStroke();
    fill(255, 153, 0);
    triangle(this.x - 15 * objectsRatio, this.y - 5 * objectsRatio, this.x, this.y - 60 * objectsRatio + random(-5, +5) * objectsRatio, this.x + 15 * objectsRatio, this.y - 5 * objectsRatio);

    ellipse(this.x, this.y, this.r + 1);

    pop();


    push();
    noStroke();
    fill(255, 255, 153);
    ellipseMode(CENTER);

    triangle(this.x - 15 * objectsRatio * this.inside, this.y - 5 * objectsRatio * this.inside, this.x, this.y - 60 * objectsRatio * this.inside + random(-5, +5) * objectsRatio * this.inside, this.x + 15 * objectsRatio * this.inside, this.y - 5 * objectsRatio * this.inside);
    pop();

    // beginShape();
    // vertex(this.x - 12 + this.rand1 , this.y + 4);
    // vertex(this.x + this.rand2 , this.y + 10);
    // vertex(this.x + 12 + this.rand3 , this.y + 4);
    // vertex(this.x + 8 + this.rand4 , this.y - 10);
    // vertex(this.x - 8 + this.rand5 , this.y - 10);
    // endShape();

    push();
    noStroke();
    fill(153, 51, 0);
    ellipse(this.x, this.y, this.r * this.inside);
    pop();
  }

  move() {
    this.y += 4 / 1920 * 3 * height; ///////////////////////////////////////////////////////
  }

}




//-----------CLASSE PER STELLE SFONDO PARALLASSE----------

class StarsOne {

  constructor() {

    this.r = 1;
    this.x = random(0, width);
    this.y = random(0, height);

  }

  display() {

    push();
    noStroke();
    fill(255, 255, 255, random(50, 255));
    ellipse(this.x, this.y, this.r, this.r);
    pop();

  }

  move() {

    if (this.y > height) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);
    } else {
      this.y += vel / 2400;
    }
  }
}





class StarsTwo {

  constructor() {

    this.r = 2;
    this.x = random(0, width);
    this.y = random(0, height);

  }

  display() {

    push();
    noStroke();
    fill(255, 255, 255, random(130, 255));
    ellipse(this.x, this.y, this.r, this.r);
    pop();

  }

  move() {

    if (this.y > height + 1) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);

    } else {
      this.y += vel / 800;
    }
  }
}




class StarsThree {

  constructor() {

    this.r = 4;
    this.x = random(0, width);
    this.y = random(0, height);
  }

  display() {

    push();
    noStroke();
    fill(255, 255, 255, random(130, 255));
    ellipse(this.x, this.y, this.r, this.r);
    pop();

  }

  move() {

    if (this.y > height + 2) //if the star goes below the screen
    {
      this.y = 0; //reset to the top of the screen
      this.x = random(0, width);
      // console.log("y 2 " + this.y);
    } else {
      this.y += vel / 320;
    }
  }
}



class Planets {

  constructor() {

    this.r = random(350, 550) * objectsRatio;
    this.x = random(0, width);
    this.y = -nextPlanet;
    this.color1 = random(0, 255);
    this.color2 = random(0, 255);
    this.color3 = random(0, 255);

  }

  display() {

    push();
    noStroke();
    fill(this.color1 - 50, this.color2 - 50, this.color3 - 50);
    ellipse(this.x, -nextPlanet, this.r);
    pop();

    push();
    noStroke();
    fill(this.color1, this.color2, this.color3);
    ellipse(this.x - this.r / 80, -nextPlanet - this.r / 80, this.r - this.r / 40);
    pop();

    push();
    noStroke();
    fill(this.color2, this.color3, this.color1, 50);
    let noiseHalo = noise(noisePlanet) * 30;
    // console.log(noiseHalo);
    ellipse(this.x, -nextPlanet, (this.r + (100 * objectsRatio) + (noiseHalo * objectsRatio)));
    noisePlanet += 0.03;
    // console.log(noisePlanet);
    pop();

  }

  // move() {
  //
  //   if (this.y > height + 150) //if the star goes below the screen
  //   {
  //     this.y = -150; //reset to the top of the screen
  //     this.x = random(0, width);
  //   } else {
  //     this.y += vel / 200;
  //   }
  // }
}
