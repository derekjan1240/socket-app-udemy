const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const path = require('path');
const http = require('http');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server)

// setup public static floder
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

let count = 0;

io.on('connection', (socket)=>{
    console.log('New webSocket connection');


    socket.on('join', ({userName, room})=>{
        socket.join(room);
        
        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage(`${userName} has joined!`));
        // socket.emit
    });

    socket.on('sendMsg', (msg, callback)=>{
        const filter = new Filter();

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!');
        }
        io.emit('message', generateMessage(msg));
        callback();
    });

    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMassage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });
    
    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A user has left!'));
    });

});

server.listen(port, ()=>{
    console.log(`listen on port ${port}`)
});