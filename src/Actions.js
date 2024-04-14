const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',                   //confirmation to server that user has joined.
    DISCONNECTED: 'disconnected',        //confirmation for leave.
    CODE_CHANGE: 'code-change',         //If code changes on editor then it should be sent to server so thst the changes could be re-rendered on other clients.
    SYNC_CODE: 'sync-code',
    LEAVE: 'leave',
};

module.exports = ACTIONS;               //When another module imports this module, it will receive the ACTIONS object.



//Here, we created Actions module separately, because there might be chances of mispelling the emitted actions like 'disconnected'
// Finding and fixing these typos can be very difficult since they're scattered all over the code.So, to prevent the typos we have made Actions module.
// We will use this on both client and server.