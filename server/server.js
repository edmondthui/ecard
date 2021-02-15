let app = express();
let server = require("http").createServer(app).listen(8080);
let socketio = require("socket.io").listen(server);

// socketio.sockets.on('connection', function() {

// })