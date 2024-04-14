import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    
    
    
    useEffect(() => {                                       
        const init = function() {                               // init() initializes code editor. 



            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                });



            editorRef.current.on('change', (instance, changes) => {     //Adding eventlistener on editor.. 'change' is an event of codemirror. change has properties such as origin(which tells that the text is written i.e +input or cut/paste etc.), text(shows the text that inputs), removed etc.  
                
                const { origin } = changes;                             //Destructuring origin from changes.
                const code = instance.getValue();                       //Getting the conntent of the editor.
                onCodeChange(code);                                     //This will send the updated code to EditorPage so that the user get the updated code in the editor on joining(Auto sync on first load)
                if (origin !== 'setValue') {                             //If dynamically (from the actual code) the editor value is changed by using setValue(), then the origin value will be setvalue.. like when the code is cut/paste the origin becomes cut/paste
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {           //so, here we are checking that the origin is not equal to setvalue.. means some changes are done by the client.. This changes should be reflect to other clients so the ACTIONS.CODE_CHANGE event is emitted. 
                        roomId,
                        code,                                           //The server will listen this event and emit to other sockets connected in that room so, that the rest clients can have updated code in their editor.
                    });
                }

            });


        }



        init();
    }, []);                                                   // The body of useEffect will be called once after code is rendered, since empty array is passed.




    useEffect(() => {                   //The useEffect is used here, because this component was rendering before the actual connection establishes as the initSocket() is await means it take some time for establishment of connection. So, it was taking the null initialised value of socketRef.
        if (socketRef.current) {       
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {      //so, initially this will run with Null and then when connection establishes, the socketRef.current get changes, it will re-render. 
                if (code !== null) {                                    //Checking that if code is null(means if by mistake the code has not been captured) then all the content of editor will be deleted(Updated to null).
                    editorRef.current.setValue(code);                       //The problem here is that, the client who has changed the code is also listening the event from server.. so the code is being overwiting and the cursor is changed to first position instead of last.. To prevent this we have used socket.in(broadcast to all, leaving the socket from where the event is emitted) instead of io.to(broadcast all)
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);         //Listener is cleaned.
        };
    }, [socketRef.current]);




    return <textarea id="realtimeEditor"></textarea>;


};

export default Editor;
