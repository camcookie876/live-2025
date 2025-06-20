const express = require('express');
const { v4: uuid } = require('uuid');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 1) Redirect “/” → “/?room=UUID” if no room supplied
app.get('/', (req, res) => {
  if (!req.query.room) {
    return res.redirect(`/?room=${uuid()}`);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2) Static assets (CSS, JS libs, client-side)
app.use(express.static(path.join(__dirname, 'public')));

// 3) Socket.io: relay chunks by room
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