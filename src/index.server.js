const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router');
let Port = 5000 || process.env.PORT;
const app = express();
const cors = require('cors');
const {addUser,removeUser,getUser,getUsersRoom} = require('./users');

const server = http.createServer(app);
const io = socketio(server);

/* const io = require('socket.io')(strapi.server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  }); */

io.on('connection', (socket) => {
    console.log("We have a new connection");

    socket.on('join',({name,room},callback)=>{
        const {error,user} = addUser({id:socket.id,name,room});

        if(error) return callback(error);
        socket.join(user.room);

        socket.emit('message',{user:"admin",text:`${user.name},welcome to the room ${user.room}`});

        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined`});

        io.to(user.room).emit('roomData',{room:user.room,users:getUsersRoom(user.room)});

        callback();
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id);

        io.to(user.room).emit('message',{user:user.name,text:message});
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersRoom(user.room)});


        callback();

    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left the room`});
        }

        //console.log("User left the connection");
    })
})

//app.use(express.json());
app.use(cors());
app.use(router);


server.listen(Port,()=>{
    console.log(`Server started on ${Port}`);
})

