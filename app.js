const io = require("socket.io-client");
const port = process.env.PORT || 3000;
const userAndRoom = {username: "CarlosG", room: "JavaScript"};
const {v4 : uuidv4} = require('uuid');
const {
    runExcelMacro
  } = require('./autobot/excelMacro.js');
var path =  require("path");

let games = io.connect(`http://localhost:${port}`,{'forceNew':true });

var macroPath = path.join(__dirname, 'autobot');
console.log(macroPath);

// let macroResult = runExcelMacro(macroPath); 
// console.log(macroResult);

games.on('connect', () => {
    console.log('Successfully connected!');
  });

games.on('disconnect', () => {
    console.log('Server has been disconnected!');
    //games.disconnect();
});

games.on("welcome", (msg) => {
    console.log("Recieved => ", msg);
});

games.on("message", (msg) => {
    console.log("Recieved => ", msg);
      if (msg === "Please reconnect!") {
    //      games.disconnect();
    //      //games.connect();
          games.emit("sendUserAndRoom", userAndRoom)
      } 
      if (msg.username == "cgongoram") {
        console.log("Se detecto comando desde el usuario CGONGORAM->" + msg.text)
        let macroResult = runExcelMacro(macroPath); 
        console.log(macroResult);
      }
});

setTimeout(() => {
    games.emit("joinRoom", userAndRoom);
}, 1000);

setInterval(() => {
    const messageId = uuidv4();
    games.emit('chatMessage', "This is my message id:" + messageId);
}, 60000);

setTimeout(() => {
    games.emit('chatMessage', "This is my message");
}, 10000);


games.on("newUser", (res) => {
    console.log(res)
});

games.on("err", (err) => {
    console.log(err)
});

games.on("success", (res) => {
    console.log(res)
});