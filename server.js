const path = require('path');
const http = require('http');
const https = require("https");
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';




var startDemo = function () {
  console.log("starting demo code");
  executeHttps(function (err, data) {
      if (err) {
          console.log("Error in running demo code");
      }
      else {
          console.log("Successfully ending demo code");
      }

  });
}

var executeHttps = function (callback) {
  var options = {
      hostname: "charliebotx.herokuapp.com",
      //port: 443,
      path: "/sayHelloSuccess/529991003098",
      method: 'GET',
      headers: {
          'Content-Type': 'text/html'
      }
  };

  var req = https.request(options, function (res) {
      console.log("Status for API call : " + res.statusCode);
      console.log("Headers for API call : " + JSON.stringify(res.headers));
      res.setEncoding('utf8');

      var body = '';

      res.on('data', function (chunk) {
          body = body + chunk;
      });

      res.on('end', function () {
          console.log("Body for API call : " + body.length);
          if (res.statusCode != 200) {
              console.log("API call failed with response code " + res.statusCode);
              callback("API call failed with response code " + res.statusCode, null)
          } else {
              console.log("Got response : " + body.length);
              callback(null, body);
          }
      });
  });

  req.on('error', function (e) {
      console.log("problem with API call : " + e.message);
      callback(e, null);
  });

  req.end();
}










// Run when client connects
io.on('connection', socket => {
  startDemo();
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
        
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    startDemo();
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    startDemo();
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
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







//startDemo();