import { io } from 'socket.io-client';      //io is a function imported from socket.io-client package

export const initSocket = async () => {   //The function is made asynchronous to use await method on it(EditorPage).

    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],   // Defining that client should try to establish a connection using websocket protocol.
    };

    return io(process.env.REACT_APP_BACKEND_URL, options); //Establish connection to the url specified

};
