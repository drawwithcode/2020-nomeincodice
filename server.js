let express = require('express');

let app = express();

let port = process.env.PORT || 80;

let server = app.listen(port);

app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server);

io.on('connection', newConnection);


let next_planet = 200;

let highscore = 0;

let changed_planet = false;

let players = 0;

let changed_info_discovery = false;


let info_score = {
  next_planet :next_planet,
  highscore: highscore,
  changed_planet: changed_planet,
  changed_info_discovery: changed_info_discovery
}

let d_player = false;

let id_players = [];

let id_player_disconnected;

let bonus_server = false;

let timer_bonus = 0;
let r_planet_express = Math.floor((Math.random() * 150) + 250);

let info_planet = {

  r : r_planet_express,
  x : Math.floor((Math.random() * 1000)),
  c1: Math.floor((Math.random() * 255)),
  c2: Math.floor((Math.random() * 255)),
  c3: Math.floor((Math.random() * 255)),
  halo : Math.floor((Math.random() * 2) + 1),
  ring : Math.floor((Math.random() * 5)),
  angle:Math.floor((Math.random() * 40) + 20),
  crater : Math.floor((Math.random() * 2) + 2),
  pos_crater_X : [(Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5), (Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5),(Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5),
    (Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5),],

  pos_crater_Y:[(Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5), (Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5),(Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5),
    (Math.random() * (r_planet_express * 0.47) - r_planet_express / 3.5),],

  dia_rand :  [(Math.random() * (r_planet_express * 0.15 ) + 1 / 10),(Math.random() * (r_planet_express * 0.15 ) + 1 / 10),(Math.random() * (r_planet_express * 0.15 ) + 1 / 10),
    (Math.random() * (r_planet_express * 0.15 ) + 1 / 10)]

}



  console.log(info_planet.x);


function newConnection(socket) {



  players++; //per ogni connessione aggiungo un giocatore

  io.sockets.emit("players", players);
  console.log('players:', players);

  socket.on("idPlayerConnected", broadcastId);

  //riceve l'Id e lo inserisce nell'array
  function broadcastId(idPlayerConnected) {

    console.log("id da client :  " + idPlayerConnected);

    id_players.push(idPlayerConnected);

    //il server manda a tutti la lista degli Id di tutti i giocatori connessi
    io.sockets.emit('idPlayerConnectedBroadcast', id_players);




  }

  console.log('new connection:', socket.client.id);

  //quando un giocatore si disconnette manda a tutti l'Id
  socket.on('disconnect', function() {
    d_player = true;
    io.sockets.emit("idPlayerDisconnected", socket.id);
    id_player_disconnected = socket.id;



    if (d_player) {

      players--;
      console.log('players:', players);
      d_player = false;

      io.sockets.emit("players", players);

      //rimuove l'Id dall'array
      for (let i = 0; i < id_players.length; i++) {
        if (id_player_disconnected === id_players[i]) {
          console.log("player disconnesso " + id_players[i]);
          id_players.splice(i, 1);
        }
      }

    } // dato che la disconnessione dura più di un tick questo if esterno
    //serve  a non decrementare "players" più di una volta per ogni disconnect


  }); //per capire se un giocatore si disconnette; il paramentro d_player serve
  //a mantenere in memoria il fatto che qualcuno si sia disconnesso



  socket.on('micvolume', micvolume_message);

  function micvolume_message(dataReceived) {

    info_score.highscore += (dataReceived.vol);


    info_score.next_planet -= dataReceived.vol/1000;

    if(bonus_server){
      // info_score.highscore += 1000;
      info_score.next_planet -= 1;

      timer_bonus++;
      if(timer_bonus >= 1 && timer_bonus < 25){
        info_score.highscore += 200*timer_bonus;
      }
      if(timer_bonus >= 25 && timer_bonus < 175){
        info_score.highscore += 5000;
      }

      if(timer_bonus >= 175 && timer_bonus < 200){
        info_score.highscore += 200 * (200 - timer_bonus);
      }
      if(timer_bonus >= 200){
        bonus_server = false;
        io.sockets.emit("bonus_effect_end", bonus_server);
        timer_bonus = 0;
        }


    }

    if(info_score.next_planet < -1000){

      createPlanet();

      io.sockets.emit("info_planet", info_planet);

      info_score.next_planet = Math.floor((Math.random() * 200) + 400);
      }

    if(info_score.next_planet < -100){
      info_score.changed_info_discovery = true;
    }else{
      info_score.changed_info_discovery = false;
    }

    socket.broadcast.emit('micvolume_in', dataReceived);

    io.sockets.emit('highscore', info_score);

  }


  socket.on('bonus', function(bonus_value) {

    io.sockets.emit("bonus_effect", bonus_value);
    bonus_server = true;

  });



  socket.on('sendXObstacle', broadcast_x_obstacle);

  function broadcast_x_obstacle(x_obstacle_collision){

    socket.broadcast.emit('collision_obstacle', x_obstacle_collision);

  }


  socket.on("giveMePlanets", give_you_planets);


}


let myInterval = setInterval(send_obstacle_x, 1000);

function send_obstacle_x(){

  let numRandom = Math.floor((Math.random() * 1000) + 1);
  io.sockets.emit("obstacle_x", numRandom);

}



let myIntervalShield = setInterval(send_shield_bonus, 20000);

function send_shield_bonus(){

  let indexRandom = Math.floor((Math.random() * id_players.length));

  io.sockets.emit("id_shield_bonus", id_players[indexRandom]);

}


function give_you_planets(){

  io.sockets.emit("info_planet", info_planet);
  console.log("dentro give me");
  console.log(info_planet.x);
}



function createPlanet(){

  console.log("aaa");

  let r_planet = Math.floor((Math.random() * 150) + 250);
  let x_planet = Math.floor((Math.random() * 1000));
  let c1_planet = Math.floor((Math.random() * 255));
  let c2_planet = Math.floor((Math.random() * 255));
  let c3_planet = Math.floor((Math.random() * 255));
  let halo_planet = Math.floor((Math.random() * 2) + 1);
  let ring_planet = Math.floor((Math.random() * 5));
  let angle_planet = Math.floor((Math.random() * 40) + 20);
  let crater_planet = Math.floor((Math.random() * 2) + 2);
  let pos_crater_X = [(Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5), (Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5),(Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5),
    (Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5),];
  let pos_crater_Y =[(Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5), (Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5),(Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5),
    (Math.random() * (info_planet.r * 0.47) - info_planet.r / 3.5),];
  let dia_rand = [(Math.random() * (info_planet.r * 0.15 ) + 1 / 10),(Math.random() * (info_planet.r * 0.15 ) + 1 / 10),(Math.random() * (info_planet.r * 0.15 ) + 1 / 10),
    (Math.random() * (info_planet.r * 0.15 ) + 1 / 10)];

  info_planet = {

    r : r_planet,
    x : x_planet,
    c1: c1_planet,
    c2: c2_planet,
    c3: c3_planet,
    halo : halo_planet,
    ring : ring_planet,
    angle: angle_planet,
    crater : crater_planet,
    pos_crater_X : pos_crater_X,
    pos_crater_Y: pos_crater_Y,
    dia_rand : dia_rand

  }


}
