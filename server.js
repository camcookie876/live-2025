const express = require('express');
const { v4: uuid } = require('uuid');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

// Redirect “/” to a new room ID
app.get('/', (_, res) => {
  res.redirect(`/?room=${uuid()}`);
});

io.on('connection', sock => {
  const room = sock.handshake.query.room;
  sock.join(room);

  // Relay media‐chunks to everyone else in the room
  sock.on('stream-chunk', chunk => {
    sock.to(room).emit('stream-chunk', chunk);
  });
});

server.listen(3000, () =>
  console.log('🚀 Livestream server running at http://localhost:3000')
);