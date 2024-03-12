const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const LISTEN_PORT = 8080;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/start.html');
});

app.get('/2D', function (req, res) {
    res.sendFile(__dirname + '/public/collab.html');
});

app.get('/3D', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

let scores = {
    player1: 0,
    player2: 0
};

let currentBackgroundColor = ''; 
let currentColor = ''; 

// Predefined colors
const predefinedColors = ['red', 'green', 'yellow', 'orange', 'purple', 'blue'];
let colorIndex = 0;

// Emit updated scores to all clients
function updateScores() {
    io.emit('updateScore', scores);
}

/// Emit current background color and color of the floor to all clients
function updateColors() {
    io.emit('updateBackgroundColor', currentBackgroundColor);
}

// setting interval to change background color every 5 seconds
setInterval(() => {
    currentBackgroundColor = predefinedColors[colorIndex];
    currentColor = predefinedColors[(colorIndex + 1) % predefinedColors.length];
    colorIndex = (colorIndex + 1) % predefinedColors.length;
    updateColors(); // Emit the updated colors to all clients
}, 5000);

//CONNECTION CONSOLE LOG
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('buttonClick', (data) => {
        if (data.color === currentColor) {
            scores[data.player]++;
            updateScores();
        }
    });

    // Listen for chat messages
    socket.on('chat message', (msg, serverOffset) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
        socket.auth.serverOffset = serverOffset;
    });
});

server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT);
