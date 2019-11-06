const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const path = require('path');
const http = require('http');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')
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


    socket.on('join', ({userName, room}, callback)=>{
        const { error, user } = addUser({id: socket.id, userName, room});
        if(error){
            callback(error);
        }else{
            socket.join(user.room);
            socket.emit('message', generateMessage('Admin', 'Welcome!'));
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.userName} has joined!`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            });
            callback();
        }
    });

    socket.on('sendMsg', (msg, callback)=>{
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!');
        }
        io.to(user.room).emit('message', generateMessage(user.userName, msg));
        callback();
    });

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMassage', generateLocationMessage(user.userName, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });
    
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.userName} has left!`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            });
        }
    });

});

server.listen(port, ()=>{
    console.log(`listen on port ${port}`)
});