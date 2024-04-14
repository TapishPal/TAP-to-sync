import React, { useState, useRef, useEffect } from 'react';
import ACTIONS from '../Actions';  
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);             //UseRef hook: if value is changed then does not cause re-rendering of the component.
    const codeRef = useRef(null);

    const location = useLocation();             //Using useLocation(), we can access several properties of the current route (URL) of the application.
    
    const { roomId } = useParams();             //useParams() is used for extracting roomId from URL, since in app.js when we have created routes, we have specified :roomId in editor url.. that we are extracting and destructured{}         
    
    const navigate = useNavigate();


    const [clients, setClients] = useState([]);


    useEffect(() => {

        const init = async () => {
            socketRef.current = await initSocket();                         //When we use useRef, React creates a mutable object with a .current property. This .current property holds the value that can be modified without causing a re-render of the component. Actually, socket is connected to server using initSocket(). But, to join the particular room we have used ACTION.JOIN.
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                navigate('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {  // tells the server that the current user has opened the page and asking to join a specific room. It sends along the room ID and the username of the user. This is basically, extra code to send username and roomId.
                roomId,
                username: location.state.username,   // The location object in the context of using useLocation() from libraries like React Router provides information about the URL and its components in web application.
            });                                        

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {         //The problem here was that after joining the client, the client editor was not updated instead it gets update on some code changes on other clients.
                        code: codeRef.current,                          //The updated code is recieved from the Editor.js
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    setClients((prev) => {              //prev will give the current state before updating i.e the list of all connected clients
                        return prev.filter(                                 //filter is used for returning a new array
                            (client) => client.socketId !== socketId        //Here, the list will get updated by checking each client socketId with the leaved user socketId and returning a new array of clients whose socketId is not same as the leaved user socketId.
                        );
                    });
                }
            );
        };
        init();
        return () => {                                      //The function returned inside useEffect is cleaning function.  
            
            socketRef.current.off(ACTIONS.JOINED);              //The listeners should be cleaned because it may cause memory leak.
            socketRef.current.off(ACTIONS.DISCONNECTED);
            
            socketRef.current.disconnect();                     //socket connection is disconnected.
        
        };
    }, []);

    async function copyRoomId() {           //We have used try, catch here because we are using browser api's and erroe might occurs.
        try {
            await navigator.clipboard.writeText(roomId);        //navigator is browser api, consists of many things such as camera, microphone etc.This will write roomId on the clipboard.
        } catch (err) {
            console.error(err);
        }
    }

    function leaveRoom() {
        navigate('/');                  //server will listen the 'disconnecting' event.
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/TAP.png"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client                         // Passsing socketId and username as props for creating Avatar.
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}           //Passed the props so, to use in Editor.js
                    roomId={roomId}
                    onCodeChange={(code) => {       //onCodeChange will get the current updated code from the Editor.js each time the code is changed.
                        codeRef.current = code;     //We send parameters from child(Editor) to parent(EditorPage) by using function call.
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;
