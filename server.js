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



let info_score = {
  next_planet :next_planet,
  highscore: highscore,
  changed_planet: changed_planet
}

let d_player = false;

let id_players = [];

let id_player_disconnected;

let bonus_server = false;

let timer_bonus = 0;
// require('events').EventEmitter.prototype._maxListeners = 1000000;


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
        info_score.highscore += 100*timer_bonus;
      }
      if(timer_bonus >= 25 && timer_bonus < 175){
        info_score.highscore += 2500;
      }

      if(timer_bonus >= 175 && timer_bonus < 200){
        info_score.highscore += 100 * (200 - timer_bonus);
      }
      if(timer_bonus >= 200){
        bonus_server = false;
        timer_bonus = 0;
      }


    }

    if(info_score.next_planet < -1440){
      info_score.next_planet = Math.floor((Math.random() * 20000) + 40000);
      info_score.changed_planet = true;
    }else{
      info_score.changed_planet = false;
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
