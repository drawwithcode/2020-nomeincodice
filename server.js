let express = require('express');

let app = express();

let highscore = 0;

let port = process.env.PORT || 80;

let server = app.listen(port);

app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server);

io.on('connection', newConnection);

let players = 0;

let d_player = false;

let id_players = [];

let id_player_disconnected;


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

    highscore += (dataReceived.vol);

    socket.broadcast.emit('micvolume_in', dataReceived);

    io.sockets.emit('highscore', highscore);

  }


  socket.on('bonus', function(bonus_value) {

    io.sockets.emit("bonus_effect", bonus_value);

  });


}


let myInterval = setInterval(send_obstacle_x, 2000);

function send_obstacle_x(){

  let numRandom = Math.floor((Math.random() * 1000) + 1);
  io.sockets.emit("obstacle_x", numRandom);

}
