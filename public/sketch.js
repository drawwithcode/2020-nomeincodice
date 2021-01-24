let socket = io();
let mic;

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

let beginGame = false;

let myOtherPlayers = [];


let infoDistance = 0;
let infoDiscoveries = 0;
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

  let idOtherPlayerLength = idOtherPlayer.length;

  for (let k = 0; k < idOtherPlayerLength; k++) {

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

  let myOtherPlayersLength = myOtherPlayers.length;
  //riceve i dati info_p e li associa agli Id corrispondenti
  for (let i = 0; i < myOtherPlayersLength; i++) {

    if (data.id === myOtherPlayers[i].getId()) {

      myOtherPlayers[i].x = otherX_players;
      myOtherPlayers[i].h = otherH_players;
      myOtherPlayers[i].shield = data.shield;
      myOtherPlayers[i].infoShieldOtherP = data.infoShieldOtherP;
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

let recreateStars = false;

socket.on('bonus_effect_end', bonusEffectEnd);

function bonusEffectEnd(bonusValue) {
  console.log("dentro funzione bonusEffectEnd");
  bonusServer = bonusValue;
  recreateStars = true;
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


let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#', '&', '*', '/', '°', '§', '|'];
let planetName1;
let planetName2;
let planetName3;
let planetName4;
let planetName5;
let precChangedPlanet = false;

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


  textFont("Squada One");


  //----------CREA LE STELLE-----------


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


  infoButton = createButton("INFO");


  infoButton.style('background-color', '#f2ff5d');
  infoButton.style('padding', '6px 12px');
  infoButton.style('font-family', 'Squada One');
  infoButton.position(width - 40, height - 45);


  infoButton.mousePressed(showInfoFunction);

  pop();

  planetName1 = letters[round(random(0, 32))];
  planetName2 = letters[round(random(0, 32))];
  planetName3 = letters[round(random(0, 32))];
  planetName4 = round(random(0, 9));
  planetName5 = round(random(0, 9));

}








let maxVol = 0.1;
let easing = 0.05;
let calibrationButton = false;
let nextPageButton = true;
let nextButton;
let nextNextPageButton = false;
let nextNextButton;
let button;
let startCalibration = false;
let varTimeout;
let noisePlanetFirstPage = 0;

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
let infoShield = false;
let e = 0;


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


  if (!bonusServer) {
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

    let myOtherPlayersLength = myOtherPlayers.length;

    for (let u = 0; u < myOtherPlayersLength; u++) {

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
    if (checkBonus === myOtherPlayersLength && checkBonus != 0 && timerBonus === 30 && yPlayer < (height * 3 / 5)) { //&& yPlayer < (height - 100)
      bonus = true;
      socket.emit('bonus', bonus);
      console.log("dentro condizioni giuste bonus");
      bonus = false;
    }

    if (bonusServer) {

      background(0, 0, 0, 50);

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


    if (nextPlanet < -15 * objectsRatio && nextPlanet > - 100 * objectsRatio) {
      background(0,0,0, - ( (nextPlanet + 15 * objectsRatio ) * 3 ));
    }

    if (nextPlanet < -100 * objectsRatio && nextPlanet > -150 * objectsRatio) {
      recreateStars = true;
      background(0);
    }


    if (nextPlanet < -150 * objectsRatio && nextPlanet > -235 * objectsRatio) {
      background(0,0,0, ( (nextPlanet + 235 * objectsRatio ) * 3 ));
    }


  //-------------------DISPLAY PIANETA-------------


  if (changedPlanet && precChangedPlanet !== changedPlanet) {
    planet = new Planets();
    infoDiscoveries++;
    planetName1 = letters[round(random(0, 32))];
    planetName2 = letters[round(random(0, 32))];
    planetName3 = letters[round(random(0, 32))];
    planetName4 = round(random(0, 9));
    planetName5 = round(random(0, 9));

  }

  planet.display();


  precChangedPlanet = changedPlanet;


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

    if (d < 30 * objectsRatio && !bonusServer && !collision && beginGame) {
      console.log("dentro collision 1");
      collision = true;

      let xObstaclesServer = obstacles[t].x / windowWidth * 1000;
      socket.emit('sendXObstacle', xObstaclesServer);

      obstacles.splice(t, 1);
      collisionTimer = frameCount;
      explosion = true;
      freezePosition = yPlayer;

    }
  }



  if (collision) {

    if (frameCount > collisionTimer + 20) {

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




  if (recreateStars) {

    console.log("dentro recreate Stars");

    starsOne.splice(0, numStarsOne);
    starsTwo.splice(0, numStarsTwo);
    starsThree.splice(0, numStarsThree);

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

    recreateStars = false;
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
    buttonShield.position(40, height - 70);


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

      infoShield = false;

    } else {

      ellipse(widthX, yPlayer + (-10 * objectsRatio), (120 + noiseShieldHalo) * objectsRatio);
      infoShield = true;

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
  } else {
    infoShield = false;
  }





  //---------MOSTRA ALTRI GIOCATORI------------

  let myOtherPlayersLength = myOtherPlayers.length;

  for (let j = 0; j < myOtherPlayers.length; j++) {
    myOtherPlayers[j].display();
  }



  push();

  textAlign(RIGHT);
  fill(242, 255, 93);

  noStroke();
  textSize(width / 22);

  text(totalscore + " tm", width - 10, 20);

  rect(width - 20, 30, 10, vel / 100);

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
  noStroke();
  ellipse(widthX, yPlayer - 10 * objectsRatio, 25 * objectsRatio, 70 * objectsRatio);
  pop();

  push();
  fill(168, 246, 179);
  noStroke();
  ellipse(widthX, yPlayer - 6 * objectsRatio, 20 * objectsRatio, 55 * objectsRatio);
  pop();


  push();
  fill(108, 201, 215);
  noStroke();
  ellipse(widthX, yPlayer - 20 * objectsRatio, 10 * objectsRatio, 10 * objectsRatio);
  pop();

  push();
  fill(168, 246, 179);
  noStroke();
  ellipse(widthX, yPlayer - 17 * objectsRatio, 10 * objectsRatio, 8 * objectsRatio);
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


  if (nextPlanet < -100 * objectsRatio && nextPlanet > -600 * objectsRatio) {


    push();
    fill(255);
    textSize(width / 14);
    textAlign(CENTER);

    text("You discovered Planet " + planetName1 + planetName2 + planetName3 + planetName4 + planetName5, width / 2, height / 2);

    pop();

    obstacles.splice(0, obstacles.length);


  }

  //----------------FINESTRA INFO GIOCATORE----------------


  if (showInfo === -1) {
    push();
    noStroke();
    fill(242, 255, 93);
    rectMode(CENTER);
    rect(width / 2, height / 10 * 7, width / 7 * 5, 60 * objectsRatio);
    pop();
    push();
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(width / 23);
    fill(0);
    infoDistance = round(infoDistance);
    text("DISTANCE TRAVELED: ", width / 5, height / 10 * 7 - 10 * objectsRatio);
    text("PLANETS DISCOVERED: ", width / 5, height / 10 * 7 + 10 * objectsRatio);
    pop();
    push();
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(width / 23);
    fill(0);
    infoDistance = round(infoDistance);
    text(infoDistance + " tm", width / 5 * 4, height / 10 * 7 - 10 * objectsRatio);
    text(infoDiscoveries, width / 5 * 4, height / 10 * 7 + 10 * objectsRatio);
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
    infoShieldOtherP: infoShield,
    vol: volHighscore

  }

if(!beginGame){

  info_p.h = height *2;

}

  socket.emit('micvolume', info_p);


  infoDistance += volHighscore;


  //------------CALIBRAZIONE MICROFONO----------------


  if (nextPageButton) {

    push();

    fill(0);
    rect(0, 0, width, height);
    pop();

    push();
    textSize(width / 7);
    textAlign(LEFT);
    fill(242, 255, 93);
    text("SHOUTING STARS", width / 13, height / 20 * 2);
    pop();

    push();

    fill(255);
    textSize(width / 20);
    textAlign(LEFT);

    text("Hi, welcome to this race!", width / 13, height / 30 * 6);
    text("We are exploring the infinite space", width / 13, height / 30 * 7);
    text("together to discover new planets,", width / 13, height / 30 * 8);
    text("everybody has its own spacecraft, ", width / 13, height / 30 * 9);
    text("but remember that you’re not alone.", width / 13, height / 30 * 10);
    text("I’m sure that together we can reach ", width / 13, height / 30 * 11);
    text("incredible goals, if we collaborate!", width / 13, height / 30 * 12);

    pop();

    noisePlanetFirstPage += 0.03;

    push();
    fill(80, 120, 220, 50);
    noStroke();
    let noiseHaloFirstPage = noise(noisePlanetFirstPage) * 30;
    ellipse(width, height, 520 + noiseHaloFirstPage);
    ellipse(width, height, 560 + noiseHaloFirstPage);
    ellipse(width, height, 600 + noiseHaloFirstPage);
    pop();


    push();
    noStroke();
    fill(200, 60, 60);
    ellipse(width, height, 500);
    pop();
    push();
    noStroke();
    fill(180, 40, 40);
    ellipse(width / 40 * 37, height / 40 * 30, 100);
    ellipse(width / 40 * 33, height / 40 * 36, 80);
    ellipse(width / 40 * 28, height / 40 * 32.5, 40);
    pop();


    push();
    noStroke();
    fill(148, 241, 255);
    triangle(width / 4 - 8 * objectsRatio, height / 30 * 19 + 33 * objectsRatio, width / 4, height / 30 * 19 + 60 * objectsRatio + random(1, 25) * objectsRatio, width / 4 + 8 * objectsRatio, height / 30 * 19 + 33 * objectsRatio);
    pop();
    push();
    noStroke();
    fill(224, 213, 195);
    triangle(width / 4 - 10 * objectsRatio, height / 30 * 19 + 33 * objectsRatio, width / 4, height / 30 * 19 + 18 * objectsRatio, width / 4 + 10 * objectsRatio, height / 30 * 19 + 33 * objectsRatio);
    pop();
    push();
    fill(121, 216, 160);
    noStroke();
    ellipse(width / 4, height / 30 * 19 - 10 * objectsRatio, 25 * objectsRatio, 70 * objectsRatio);
    pop();
    push();
    fill(168, 246, 179);
    noStroke();
    ellipse(width / 4, height / 30 * 19 - 6 * objectsRatio, 20 * objectsRatio, 55 * objectsRatio);
    pop();
    push();
    fill(108, 201, 215);
    noStroke();
    ellipse(width / 4, height / 30 * 19 - 20 * objectsRatio, 10 * objectsRatio, 10 * objectsRatio);
    pop();
    push();
    fill(168, 246, 179);
    noStroke();
    ellipse(width / 4, height / 30 * 19 - 17 * objectsRatio, 10 * objectsRatio, 8 * objectsRatio);
    pop();
    push();
    noStroke();
    fill(32, 135, 113);
    beginShape();
    vertex(width / 4 + 10 * objectsRatio, height / 30 * 19 + 5 * objectsRatio);
    vertex(width / 4 + 22 * objectsRatio, height / 30 * 19 + 10 * objectsRatio);
    vertex(width / 4 + 18 * objectsRatio, height / 30 * 19 + 35 * objectsRatio);
    vertex(width / 4 + 17 * objectsRatio, height / 30 * 19 + 17 * objectsRatio);
    vertex(width / 4 + 8 * objectsRatio, height / 30 * 19 + 13 * objectsRatio);
    endShape();
    beginShape();
    vertex(width / 4 - 10 * objectsRatio, height / 30 * 19 + 5 * objectsRatio);
    vertex(width / 4 - 22 * objectsRatio, height / 30 * 19 + 10 * objectsRatio);
    vertex(width / 4 - 18 * objectsRatio, height / 30 * 19 + 35 * objectsRatio);
    vertex(width / 4 - 17 * objectsRatio, height / 30 * 19 + 17 * objectsRatio);
    vertex(width / 4 - 8 * objectsRatio, height / 30 * 19 + 13 * objectsRatio);
    endShape();
    beginShape();
    vertex(width / 4, height / 30 * 19 + 2 * objectsRatio);
    vertex(width / 4 + 3 * objectsRatio, height / 30 * 19 + 4 * objectsRatio);
    vertex(width / 4 + 4 * objectsRatio, height / 30 * 19 + 7 * objectsRatio);
    vertex(width / 4, height / 30 * 19 + 45 * objectsRatio);
    vertex(width / 4 - 4 * objectsRatio, height / 30 * 19 + 7 * objectsRatio);
    vertex(width / 4 - 3 * objectsRatio, height / 30 * 19 + 4 * objectsRatio);
    endShape(); //////////////////////////////////////////////////////////////
    pop();




    if (!nextButton) {
      nextButton = createButton("NEXT");
    }

    nextButton.position(width / 2, height / 10 * 8.5);

    nextButton.mousePressed(nextPage);
    nextButton.style('background-color', '#f2ff5d');
    nextButton.style('padding', '6px 12px');
    nextButton.style('font-family', 'Squada One');


    infoButton.hide();

  }

  if (nextNextPageButton) {

    push();

    fill(0);
    rect(0, 0, width, height);
    pop();

    push();
    fill(242, 255, 93);
    textSize(width / 10);
    textAlign(LEFT);

    text("Rules:", width / 13, height / 30 * 4);

    pop();

    push();

    fill(255);
    textSize(width / 20);
    textAlign(LEFT);

    text("- Scream and shout to increase", width / 8, height / 30 * 6);
    text("   the velocity of your spacecraft:", width / 8, height / 30 * 7);
    text("   your energy is the thruster.", width / 8, height / 30 * 8);
    text("- Tilt your phone to move horizontally", width / 8, height / 30 * 10);
    text("   and avoid obstacles.", width / 8, height / 30 * 11);
    text("- You could have the opportunity", width / 8, height / 30 * 13);
    text("   to protect yourself and your mates:", width / 8, height / 30 * 14);
    text("   pay attention, sometimes in the bottom", width / 8, height / 30 * 15);
    text("   left corner could appear a blue button", width / 8, height / 30 * 16);
    text("   to use your shield. Use it wisely.", width / 8, height / 30 * 17);
    text("- Do your best: this is a collaborative", width / 8, height / 30 * 19);
    text("   exploration so give your contribution,", width / 8, height / 30 * 20);
    text("   and if you are on the same wave of the", width / 8, height / 30 * 21);
    text("   others, something good will happen.", width / 8, height / 30 * 22);

    pop();




    infoButton.hide();

  }

  if (calibrationButton) {

    push();
    fill(0);
    rect(0, 0, width, height);
    pop();

    push();
    fill(46, 165, 219);
    textSize(width / 10);
    textAlign(LEFT);
    text("Before we start", width / 9, height / 30 * 14);
    pop();


    push();
    fill(255);
    textSize(width / 20);
    textAlign(LEFT);

    text("We have to calibrate your microphone. ", width / 9, height / 30 * 16);
    text("Click the button and talk to your phone,", width / 9, height / 30 * 17);
    text("we’re going to start in few seconds.", width / 9, height / 30 * 18);
    pop();

  }


  if (startCalibration) {
    maxVol = max(maxVol, vol);
    button.remove();
  }



  if (height < width) {

    background(0);

    push();
    noStroke();
    textSize(width / height * 20);
    textAlign(CENTER, CENTER);
    fill(242, 255, 93);
    text("Welcome to SHOUTING STARS", width / 2, height /4);
    pop();

    push();
    noStroke();
    textSize(width / height * 10);
    textAlign(CENTER, CENTER);
    fill(242, 255, 93);

    text("To play, you need to access this", width / 2, height /4 + width / height * 30);
    text(" website from a mobile phone.", width / 2, height /4 + width / height * 40) ;
    text("If you are using your phone horizontally,", width / 2, height /4 + width / height * 50);
    text("please turn it and reload the page.", width / 2, height /4 + width / height * 60);
    pop();

    nextButton.hide();

  }


}





function nextNextPage() {

  calibrationButton = true;
  nextNextPageButton = false;
  nextNextButton.remove();

  if (!button) {
    button = createButton("START");
  }

  button.position(width / 2, height / 10 * 8.5);

  button.mousePressed(calibrationMicrophone);
  button.style('background-color', '#2ea4db');
  button.style('padding', '6px 12px');
  button.style('font-family', 'Squada One');

}


function nextPage() {

  nextNextPageButton = true;

  if (!nextNextButton) {
    nextNextButton = createButton("NEXT");
  }

  nextNextButton.position(width / 2, height / 10 * 8.5);

  nextNextButton.mousePressed(nextNextPage);
  nextNextButton.style('background-color', '#f2ff5d');
  nextNextButton.style('padding', '6px 12px');
  nextNextButton.style('font-family', 'Squada One');


  nextPageButton = false;
  nextButton.remove();

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

  constructor(id, x, h, shield, infoShieldOtherP) {
    this.id = id;
    this.x = x;
    this.h = h;
    this.shield = shield;
    this.infoShieldOtherP = infoShieldOtherP;
    this.smaller = 2 / 3;
  }

  display() {


      push();

      if (this.shield) {
        noStroke();
        fill(160, 220, 255, 150);
        let noiseShieldHaloOther = noise(noiseShieldOther) * 10;
        noiseShieldOther += 0.1;

        if (this.infoShieldOtherP) {
          ellipse(this.x, this.h + (-10 * objectsRatio * this.smaller), (120 + noiseShieldHaloOther) * objectsRatio);

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
      this.y += vel / 600;
    }
  }
}



class Planets {

  constructor() {

    this.r = random(250, 400) * objectsRatio;
    this.x = random(0, width);
    this.y = -nextPlanet;
    this.color1 = random(0, 255);
    this.color2 = random(0, 255);
    this.color3 = random(0, 255);
    this.halo = round(random(1, 3));
    this.ring = round(random(0, 5));
    this.angle = round(random(20, 60));
    this.crater = round(random(2, 4));
    this.posCraterX = [random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5),
      random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5)
    ];
    this.posCraterY = [random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5),
      random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5), random(-this.r / 3.5, this.r / 5.5)
    ];

    this.diaRand = [random(this.r / 10, this.r / 4), random(this.r / 10, this.r / 4), random(this.r / 10, this.r / 4),
      random(this.r / 10, this.r / 4), random(this.r / 10, this.r / 4), random(this.r / 10, this.r / 4)
    ];

  }

  display() {



    if (this.halo === 1) {

      push();
      noStroke();
      fill(this.color2, this.color3, this.color1, 50);
      let noiseHalo = noise(noisePlanet) * 30;

      ellipse(this.x, -nextPlanet, (this.r + (100 * objectsRatio) + (noiseHalo * objectsRatio)));
      noisePlanet += 0.03;

      pop();

    }

    if (this.halo === 2) {

      push();
      noStroke();
      fill(this.color2, this.color3, this.color1, 50);
      let noiseHalo = noise(noisePlanet) * 30;

      ellipse(this.x, -nextPlanet, (this.r + (60 * objectsRatio) + (noiseHalo * objectsRatio)));
      ellipse(this.x, -nextPlanet, (this.r + (100 * objectsRatio) + (noiseHalo * objectsRatio)));
      noisePlanet += 0.03;

      pop();

    }


    if (this.halo === 3) {

      push();
      noStroke();
      fill(this.color2, this.color3, this.color1, 50);
      let noiseHalo = noise(noisePlanet) * 30;

      ellipse(this.x, -nextPlanet, (this.r + (20 * objectsRatio) + (noiseHalo * objectsRatio)));
      ellipse(this.x, -nextPlanet, (this.r + (60 * objectsRatio) + (noiseHalo * objectsRatio)));
      ellipse(this.x, -nextPlanet, (this.r + (100 * objectsRatio) + (noiseHalo * objectsRatio)));
      noisePlanet += 0.03;

      pop();

    }

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


    for (let g = 0; g < this.crater; g++) {

      push();
      noStroke();
      fill(this.color1 - 50, this.color2 - 50, this.color3 - 50);
      ellipse(this.x + this.posCraterX[g], -nextPlanet + this.posCraterY[g], this.diaRand[g]);
      pop();

    }








    if (this.ring === 1) {

      push();
      noStroke();
      fill(255 - this.color2 / 2, 255 - this.color3 / 2, 255 - this.color1 / 2);
      angleMode(DEGREES);
      translate(this.x, -nextPlanet);
      rotate(this.angle);
      ellipse(0, 0, this.r * 2, this.r / 8);
      pop();

      // push();
      // noStroke();
      // fill(this.color1, this.color2, this.color3);
      // angleMode(DEGREES);
      // translate(this.x , -nextPlanet) ;
      // rotate(this.angle);
      // translate(0, - this.r / 16);
      // ellipse(0, 0, this.r, this.r / 8);
      // pop();


    }

    if (this.ring === 2) {

      push();
      noStroke();
      fill(255 - this.color2 / 2, 255 - this.color3 / 2, 255 - this.color1 / 2);
      angleMode(DEGREES);
      translate(this.x, -nextPlanet);
      rotate(this.angle / 2);
      ellipse(0, 0, this.r * 1.8, this.r / 8);
      pop();

      push();
      noStroke();
      fill(255 - this.color2 / 2, 255 - this.color3 / 2, 255 - this.color1 / 2);
      angleMode(DEGREES);

      translate(this.x, -nextPlanet);
      rotate(-this.angle / 2);
      ellipse(0, 0, this.r * 1.8, this.r / 8);
      pop();

    }

    if (this.ring === 3) {

      push();
      noStroke();
      fill(255 - this.color2 / 2, 255 - this.color3 / 2, 255 - this.color1 / 2);
      angleMode(DEGREES);
      translate(this.x + this.r / 16, -nextPlanet - this.r / 16);
      rotate(this.angle);
      ellipse(0, 0, this.r * 1.8, this.r / 8);
      pop();

      push();
      noStroke();
      fill(255 - this.color2 / 2, 255 - this.color3 / 2, 255 - this.color1 / 2);
      angleMode(DEGREES);
      translate(this.x - this.r / 12, -nextPlanet + this.r / 12);
      rotate(this.angle);
      ellipse(0, 0, this.r * 1.4, this.r / 12);
      pop();


    }


  }

}
