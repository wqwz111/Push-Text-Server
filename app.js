var config = require('./config.json');
var DbHelper = require('./db');
var dbHelper = new DbHelper(config.db, null, null);
var server = require('https').createServer();
var io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pintTimeout: 5000,
    cookie: false
});
server.listen(process.env.PORT || config.port);


io.on('connection', function (socket) {

    socket.on('login', function (req, ack) {
        dbHelper.createAnonyUser().then(function (user) {
            socket.emit('logged-in', user);
            ack && ack();
        });
    });

    socket.on('logout', function(req, ack) {
        var userId = req.user_id;
        dbHelper.getCurrentRoom(userId).then(function (currRoom) {
            if (currRoom) {
                var currRoomNo = currRoom.roomNo;
                dbHelper.leaveRoom(currRoomNo, userId).then(function() {
                    console.log("leave room " + currRoomNo + " success.");
                    ack && ack();
                });
            }
            socket.emit('logged-out', null);
        });
    });

    socket.on('enter-room', function (req, ack) {
        var userId = req.user_id;
        var newRoom = req.new_room;
        dbHelper.getCurrentRoom(userId).then(function (currRoom) {
            if (currRoom) {
                var currRoomNo = currRoom.roomNo;
                socket.leave(currRoomNo, function () {
                    dbHelper.leaveRoom(currRoomNo, userId).then(function() {
                        socket.join(newRoom, function () {
                            dbHelper.enterRoom(newRoom, userId).then(function (room) {
                                console.log("enter room " + newRoom + " success.");
                                 ack && ack(room.messages);
                            });
                        });
                    });
                });
            } else {
                socket.join(newRoom, function () {
                    dbHelper.enterRoom(newRoom, userId).then(function (room) {
                        console.log("enter room " + newRoom + " success.");
                        ack && ack(room.messages);
                    });
                });
            }
        });
    });

    socket.on('leave-room', function (req, ack) {
        socket.leave(req.current_room, function (err) {
            dbHelper.leaveRoom(req.current_room, req.user_id).then(function() {
                console.log("leave room " + req.current_room + " success.");
                ack && ack();
            });

        });
    });

    socket.on('new-message', function (req, ack) {
        dbHelper.getCurrentRoom(req.user_id).then(function (currRoom) {
            socket.to(currRoom.roomNo).emit('broadcast', req.msg);
            dbHelper.pushMessage(currRoom.roomNo, req.msg).then (function (room) {
                ack && ack(room.messages);
            });
        });
    });

});