const express = require('express');
const { v4: uuid } = require('uuid');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (_, res) => {
  // If no room param, generate one
  const room = _.query.room || uuid();
  res.redirect(`/?room=${room}`);
});

io.on('connection', (socket) => {
  const room = socket.handshake.query.room;
  socket.join(room);
  socket.on('stream-chunk', (chunk) => {
    socket.to(room).emit('stream-chunk', chunk);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Livestream running on http://localhost:${PORT}`)
);