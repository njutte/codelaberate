const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const state = {
    code: 'console.log(\'p\');',
    result: 'initialized',
    goal: 'Hello world',
};

const players = new Set();

const path = require('path');

const rules = require('./rules');

app.get('/', function(req, res) {
    const indexFilePath = path.resolve('client', 'index.html');
    res.sendFile(indexFilePath);
});

io.on('connection', function (socket) {
    socket.emit('code refresh', state);
    socket.on('name change', function ({ name, newName }) {
        if (name) players.delete(name);
        players.add(newName);
        io.emit('player-change', Array.from(players.values()).sort());
    });
    
    socket.on('code submit', function(newCode){
        const changeValidity = rules.validateChange(state.code, newCode);
        console.log(changeValidity);
        if(changeValidity !== 'valid') {
            socket.emit('code refresh', { ...state, result: isVaildChange });
            return;
        }
        state.code = newCode;
        let result = '';
        try {
            result = rules.testCode(newCode);
        } catch (error) {
            result = error.message;
        }
        console.dir(result);
        state.result = result;

        io.emit('code refresh', state);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
})

http.listen(3000, function () {
    console.log('listening on *:3000');
});