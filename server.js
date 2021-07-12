const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const { exit } = require('process');
const { Console } = require('console');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'CSCotia';

var users = [];
var teams = [[], [], [], [], [], [] ]
var teams_amount = 2;
var current_team = 0;

// Run when client connects
io.on('connection', socket => {

  var numClients = {};

  var info = [[], [], 2]
    info[0] = users;
    info[1] = teams;
    info[2] = teams_amount;
    var sendd = "OJ" + JSON.stringify(info);
    socket.send(sendd);

  socket.on('joinRoom', ({ username, room }) => {
    
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

      // Update users list
    function outputUsers(users) {
     var sendd = "NU" + JSON.stringify(users)
     users.forEach((username) => {
        socket.send(sendd);
      });
    }

    if(checkInput(username)) {
    users.push(username);
    console.log('Usuarios ativos:', users);
    outputUsers(users);
  } else {
    console.log(sendd);
  }
    
    var numClients = io.sockets.adapter.rooms[user.room];

      if (numClients[socket.room] == undefined) {
          numClients[socket.room] = 1;
      } else {
          numClients[socket.room]++;
      };

    io.to(user.room).emit('roomUsersCount', {usercount: numClients[socket.room]});

    function checkInput(input) {

      // if already in the list
      for (i = 0; i < users.length; i++) {
        if(users[i].toLowerCase() == input.toLowerCase()) {
          return false;
        }}
    
      // If empty
      if(input.trim() !== ""){
        return true;
      } else {
        return false;
      }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    socket.on('message', function(message) {

      // RE ROLL
      if(message.startsWith("RR")) {
        console.log('Mensagem Recebida contendo RR')
        shuffle(users);
        teams = [[], [], [], [], [], []];
        current_team = 0;
        for (i = 0; i < users.length; i++) {
          if(current_team == teams_amount) {
            current_team = 0;
          }
          teams[current_team].push(users[i]);
          current_team += 1;
        }
        teams_list_send_all(teams)
      }
  
      // team size change
      if(message.startsWith("TS")) {
        teams_amount = message.substring(2)
        team_size_update(teams_amount)
      }
    })

    // Shuffle
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle
      while (0 !== currentIndex) {

     // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
      }

      return array;
    }
   console.log('Sorteio', shuffle(users))

   // Update teams list
    function teams_list_send_all(teams) {
      var sendd = "NT" + JSON.stringify(teams)
      users.forEach((username) => {
        socket.send(sendd);
      });
      console.log(sendd);
      wrtiteToTeamsList(teams);
    }

    function wrtiteToTeamsList(all_teams) {
      var send_this = "";
    
      //  for each team
      for (i = 0; i < all_teams.length; i++) {
    
        // the array is defined and has at least one element
        if (typeof all_teams[i] !== 'undefined' && all_teams[i].length > 0) {
          var addthis = "";
    
          // For each team member in team
          for (j = 0; j < all_teams[i].length; j++) {
            addthis += "<h2>"+all_teams[i][j]+"</h2>";
          }
          send_this += "<h1>Time " + (i+1) + "</h1>" + addthis;
        }
    
      // Update teams list
      //document.getElementById('teams_list').innerHTML = send_this;
      io.to(user.room).emit('teamNames', {send_this});
    }
      console.log(send_this)
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} entrou na lobby`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {

    const user = userLeave(socket.id);

    if (user) {

      var numClients = io.sockets.adapter.rooms[user.room];
      var clean = user.username

      if (numClients == undefined) {
          numClients = {};
      } else {
          numClients[socket.room]--;
          io.to(user.room).emit('roomUsersCount', {
            usercount: numClients[socket.room]
          });
          console.log('Player desconectado', user.username)
          var clean = user.username
          for (i = 0; i < users.length; i++) {
            if(users[i] == clean) {
              users.splice([i], 1);
            }
          }
      };

      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} saiu da lobby`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
