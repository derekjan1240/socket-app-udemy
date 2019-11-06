const socket = io();

// Elements
const msgSendButton = document.querySelector('#msgSendButton');
const locationSendButton = document.querySelector('#locationSendButton');
const msgInput = document.querySelector('#msgInput');
const message = document.querySelector('#message');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {userName, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.on('message', (msg)=>{
    console.log(msg);
    const html = Mustache.render(messageTemplate, {
        userName: msg.userName,
        message: msg.text,
        createAt: moment(msg.createAt).format('lll')
    });
    message.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMassage', (msg)=>{
    console.log(msg);
    const html = Mustache.render(locationMessageTemplate, {
        userName: msg.userName,
        url: msg.url,
        createAt: moment(msg.createAt).format('lll')
    });
    message.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({room, users})=>{
    console.log({room, users});
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

document.addEventListener("DOMContentLoaded", ()=> {
    msgSendButton.addEventListener('click', (e)=>{  
        e.preventDefault();
        msgSendButton.setAttribute("disabled", true);

        const msg = msgInput.value;
        if(msg){
            socket.emit('sendMsg', msg, (err)=>{    
                if(err){
                    return console.log(err)
                }
                // reset msg input 
                msgInput.value = '';
                console.log('The message was delivered!');
            });
        }
        msgSendButton.removeAttribute("disabled");
    });

    locationSendButton.addEventListener('click',(e)=>{
        e.preventDefault();
        locationSendButton.setAttribute("disabled", true);

        if(!navigator.geolocation){
            return alert('Geolocation is not support by your browser!')
        }
        navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('sendLocation',{
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, ()=>{
                locationSendButton.removeAttribute("disabled");
                console.log('Location shared!');
            });
        });
    });
}); 

socket.emit('join', {userName, room}, (error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});