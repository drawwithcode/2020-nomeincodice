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

let obstacles_X = [];

let obstacles_Y = [];


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

    info_score.next_planet -= (dataReceived.vol);

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

  });



  socket.on('collision', function(h)  {

    io.sockets.emit("index_collision", h);
    console.log(h);

  });

}

for(let f = 0; f < 10; f++){

  let num_random = Math.floor((Math.random() * 1000) + 1);
  let y_obstacle = - 144 * f - 15;
  obstacles_X.push(num_random);
  obstacles_Y.push(y_obstacle);


}


let myInterval = setInterval(send_obstacle_info, 16);

function send_obstacle_info(){

  io.sockets.emit("obstacles_X", obstacles_X);
  io.sockets.emit("obstacles_Y", obstacles_Y);

  for(let p = 0; p < 10; p++){

    obstacles_Y[p] += 4;

    if(obstacles_Y[p] > 1440 + 15){

      obstacles_Y[p] = - 15;
      obstacles_X[p] = Math.floor((Math.random() * 1000) + 1);

      io.sockets.emit("reset_index", p);

    }

    // console.log(obstacles_Y[p]);

  }

}
