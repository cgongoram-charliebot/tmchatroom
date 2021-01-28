var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer =  require('multer');
var favicon = require('serve-favicon');

const {v4 : uuidv4} = require('uuid');
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
const { stringify } = require('querystring');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// var callSchema= new mongoose.Schema({
//   requestObject:String
// })
// var callModel = mongoose.model('calldemo',callSchema);

var messageSchema= new mongoose.Schema({
  Id: String,
  message: String,
  recieved: { type: Date, default: new Date(new Date().toUTCString()) },
  processed: { type: Date },
  acknowledged: { type: Date },
  macroStderr: String,
  macroStdout: String,
  macroStatus: String
})
var messageModel = mongoose.model('messagesDemo',messageSchema);
const databadeUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/messages'
console.log(databadeUri);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/messages',{useNewUrlParser:true, useUnifiedTopology: true})
.then(()=>console.log('Database connected!')).catch(err=>console.log('error ocured',err));


// setTimeout(() => {
//   //var dateProcessed = new Date(new Date().toUTCString());
//   var dateProcessed = new Date(new Date(2000, 0, 1, 0, 0, 0, 0).toUTCString());
//   //var dateAcknowledged = new Date(new Date().toUTCString());
//   var dateAcknowledged = new Date(new Date(2000, 0, 1, 0, 0, 0, 0).toUTCString());
//   var newId = uuidv4();
//   var temp = new messageModel({
//     Id: newId,
//     message: "This is a test MESSAGE string",
//     //recieved: Date.now ,
//     processed: dateProcessed,
//     acknowledged: dateAcknowledged,
//     macroStderr: "This is a test macroStderr string",
//     macroStdout: "This is a test macroStdout string",
//     macroStatus: "This is a test macroStatus string"
//   })
//   temp.save((err,data)=>{
//     if(err){
//         console.log(err)
//     }
//   console.log("New record succesfully saved", data);
// })
// }, 20000);

  



// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'ChatCord Bot';


// Run when client connects
io.on('connection', socket => {
  console.log(socket.client.request.headers.referer, "\nNew user connected!\n", socket.id, typeof username);

   if (typeof socket.client.request.headers.referer == "undefined" && typeof username === "undefined") {

      //console.log(JSON.stringify(socket));
      // Object.entries(socket).forEach(entry => {
      //   const [key, value] = entry;
      //   console.log(key, value);
      // });
 
     //var userJsonString = JSON.stringify(user);
     //console.log(`Reconnecting socket.id -> ${socket.id}`);
     socket.emit('message', `Please reconnect!`); 
   } 
   //else {

  socket.on('joinRoom', ({ username, room }) => {
    console.log(`New user: ${username} has connected to room: ${room}`);
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
    //startDemo();
    const user = getCurrentUser(socket.id);
    console.log(msg);
    
    if (typeof user != "undefined") {
      console.log(`The user: ${user.username} with id: ${socket.id} has sent the message: ${msg}`);
       //Send users and room info
      io.to(user.id).emit('message', formatMessage(user.username, `Confirmation to the user: ${user.username} with id: ${socket.id} your message: ->${msg}<- was recieved`));
      io.to(user.room).emit('message', formatMessage(user.username, msg));
      saveMessageToDatabase (msg, "macroStderr", "macroStdout", "macroStatus");
    };
  }); 
 
  
  // Listen for sendUserAndRoom
  socket.on('sendUserAndRoom', msg => {
    //startDemo();
    const newUser = userJoin(socket.id, msg.username, msg.room);
    const user = getCurrentUser(socket.id);
    let messageFormatted = formatMessage(user.username, `The user: ${user.username} with id: ${socket.id} was reconnected to the server`)

    console.log(`The user: ${newUser.username} with id: ${socket.id} has rejoined the room: ${newUser.username}`);
    console.log(`The user: ${user.username} with id: ${socket.id} has been added to the users list on the server...`);
    // Send users and room info
    
    io.to(user.id).emit('message', messageFormatted);
    //io.to(user.room).emit('message', formatMessage(user.username, msg));
  }); 
 
  // Runs when client disconnects
  socket.on('disconnect', () => {
    //startDemo();
    
    const user = userLeave(socket.id);

    if (user) {
      console.log(`${user.username} with id: ${socket.id} has left the chat`);
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




function saveMessageToDatabase(messageText, macroStderr, macroStdout, macroStatus) {
  var messageResult = {}
  //var dateProcessed = new Date(new Date().toUTCString());
  var dateProcessed = new Date(new Date(2000, 0, 1, 0, 0, 0, 0).toUTCString());
  //var dateAcknowledged = new Date(new Date().toUTCString());
  var dateAcknowledged = new Date(new Date(2000, 0, 1, 0, 0, 0, 0).toUTCString());
  var newId = uuidv4();
  var messageModelValues = {
    Id: newId,
    message: messageText,
    //recieved: Date.now ,
    processed: dateProcessed,
    acknowledged: dateAcknowledged,
    macroStderr: macroStderr,
    macroStdout: macroStdout,
    macroStatus: macroStatus
  }
  var temp = new messageModel(messageModelValues)
  temp.save((err,data)=>{
    if(err){
        console.log(err)
        
    }
  console.log("New record succesfully saved", data);
  messageResult.messageSavedValues = messageModelValues;
  messageResult.databaseErr = err;
  messageResult.databaseReply = data;
  });
  return messageResult
  
}


