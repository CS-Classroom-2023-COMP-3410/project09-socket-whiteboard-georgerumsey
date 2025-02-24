const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

let boardState = []; // In-memory board state for drawing actions

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send the full board state to new client
  socket.emit('boardState', boardState);

  // Listen for drawing events from client, store and broadcast to others
  socket.on('drawing', (data) => {
    console.log('Received drawing data:', data); // Add this line
    boardState.push(data);
    socket.broadcast.emit('drawing', data); // Broadcast to all other clients
  });

  // Listen for board clear events, reset state and notify all
  socket.on('clearBoard', () => {
    console.log('Received clearBoard event'); // Add this line
    boardState = [];
    io.emit('clearBoard');
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});