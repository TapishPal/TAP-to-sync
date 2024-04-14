const express = require('express');
const app = express();

const http = require('http');

const path = require('path');

const { Server } = require('socket.io');            //Server class of socket.io

const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);                      //io is an instance of Server class

app.use(express.static('build'));               //build is used for deployment and optimization.

app.use((req, res, next) => {                                   //Since, the react application is injected inside index.html file present in build folder. So, for production and deployement of application, when any request is sent to server(port:3000), then index.html file should be sent to client.
    res.sendFile(path.join(__dirname, 'build', 'index.html'));      //The routing was handled by the Home page(React) so, after refreshing the page(Express) was not displayed , so index.html is sent to client which has react application injected, handles the routing and redirects to the specified url.
});

const userSocketMap = {};    //userSocketMap is an object which will store the record of socketId of each user. Key(socket.id), value(username). This is currently storing in memory, so if server gets restarted, this data will be deleted, so prefer to store in the database.


function getAllConnectedClients(roomId) {       

    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(          //It will check for the connected rooms in the adapter of io socket server.If particular room id matches it will return all the socket id's of room in "Map" datatype else an empty array. We are converting that Map to Array using Array.from and then we are mapping on each socketId.
        (socketId) => {
            return {
                socketId,                                               //Returning array of socketId and username. 
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {                           //'connection' event will be triggered on when server will get socket
    
    
    console.log('socket connected', socket.id);

    
    
    
    
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {     //listening the join event emitted from EditorPage
               
        userSocketMap[socket.id] = username;                //Storing username corresponding to it's socket.id in userMap object. 
        
        socket.join(roomId);                                //Adding socket to particular roomId. If that particular room exists then it will add to that room else it will create a new room.
        
        const clients = getAllConnectedClients(roomId);     //Here, getAllConnectedClients will give a object array consisting of socketId and corresponding username.
        
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {          //An event ACTIONS.JOINED will be emitted to each socketId of the room and the data(clients, username who has joined, socket.id(socket id of the user that connected)) will be sent.
                clients,
                username,
                socketId: socket.id,
            });
        });

    });



    
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });      //After recieving code change event, server will cahnge code change event to each socket in roomID so that everyone can update the code in their editors.
    });




    
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {          //To sync the code editor on first load of the newly joined client.
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });        
    });




    
    
    socket.on('disconnecting', () => {              //'disconnecting' is a state before the socket connection is completely closed. It allows to perform any necessary actions before the connection is closed completely. 
        
        const rooms = [...socket.rooms];            //The ACTIONS.DISCONNECTED event will be emitted to all the sockets connected to all rooms that the user has connected with a particular socketId. A user can join as many rooms with a particular socket id using the code 'socket.join(roomId1) socket.join(roomId2)...'. Similarly, a user can join a room with different socketIds by opening different tabs. There are no limit of generation of unique socketIds and no limit of joining different rooms.
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {      //socket.in(room) method allows to send message to all the socketIds in that room.
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];        //The socket.id and username will be deleted from userSocketMap.
        socket.leave();                         //Since, in this method no room is specified like 'socket.leave(room1)' so, socket will leave from all the rooms to which it was connected. It will stop recieving messages from rooms.
    });


});

const PORT = 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
