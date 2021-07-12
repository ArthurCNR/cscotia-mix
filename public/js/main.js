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

// Get teams and users
socket.on('teamNames', ({ send_this }) => {
  outputTeamName(send_this);
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

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


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

function outputTeamName(send_this) {
  teamList.innerHTML = send_this;
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
