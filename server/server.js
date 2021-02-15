  
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (sock) => {

  console.log("connected");
});

server.on('error', (err) => {
  console.error(err);
});

server.listen(8080, () => {
  console.log('server is ready');
});