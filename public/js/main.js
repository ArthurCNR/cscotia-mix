const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const teamList = document.getElementById('teams_list');
const userCount = document.getElementById('users-count');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });


// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('teamUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('roomUsersCount', ({ usercount }) => {
  outputUsersCount(usercount);
});

// update team size
function update_team_size(size) {
  var team_text = "Teams: " + size;
  document.getElementById('teamSize').innerHTML = team_text;
}

// Message from server
socket.on('message', (message) => {

  console.log(message);
  outputMessage(message);

  if(message.startsWith('NT')) {
    var all_teams = JSON.parse(message.substring(2));
    wrtiteToTeamsList(all_teams);
    console.log('Sorteio finalizado');
  }



  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

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
      send_this += "<h1>Team " + (i+1) + "</h1>" + addthis;
    }

  // Update teams list
  document.getElementById('teams_list').innerHTML = send_this;
  }
}

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  //p.innerText = message.username;
  //p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsersCount(usercount) {
  userCount.innerText = usercount;
  }


// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('h2');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Re roll
document.getElementById('reRoll').onclick = function() {
  const randomizer = confirm('Are you sure you randomizer?');
  if (randomizer) {
    socket.send("RR");
    console.log('RR');
  } else {
  }
}


//Prompt the user before leave chat room
document.getElementById('sair-buttn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
