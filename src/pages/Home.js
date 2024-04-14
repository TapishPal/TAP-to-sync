import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';    // UUID version 4, which generates random UUIDs. Another method is UUID version 1, which combines a unique identifier based on the current time with the unique MAC address of the generating computer.
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');


    const createNewRoom = (e) => {
        e.preventDefault();     // Since, new room is a link, so on clicking it the page reloads, so preventDefault() tells the browser not to execute the default action associated with the event. For example, if e represents a click event on an anchor (<a>) element, calling e.preventDefault() will prevent the browser from following the link and reloading.
        const id = uuidV4();    // universally unique identifiers (UUIDs) is a 128-bit number, designed to be globally unique across space and time. This means that the probability of two UUIDs being the same is extremely low, even when generated by different computers or at different points in time.  The total number of possible UUIDs is 2^128, which is an astronomically large number (approximately 3.4 x 10^38).  UUIDs can be generated locally without coordination with a central server. This makes them useful in distributed systems where entities need unique identifiers without relying on a central source.
        setRoomId(id);
    };


    const joinRoom = () => {
        if (!roomId || !username) {
            return;                     //Navigate code will not execute.
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {                //state is a property(such as pathname, search(query)) of location(URL) which is use to pass data(here, username) from one route(i.e home) to another route(EditorPage) without exposing it in the URL, keeping sensitive or temporary data hidden from the user.
                username,       
            },
        });
    };



    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img
                    className="homePageLogo"
                    src="TAP.png"
                />
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>Tapish Pal &nbsp; Abhay Thagle &nbsp; Pratik Barche</h4>
            </footer>
        </div>
    );
};

export default Home;  
