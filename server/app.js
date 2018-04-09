var config = require('./config.json');
var app = require('express')();
var DbHelper = require('./db');
var dbHelper = new DbHelper(config.db, null, null);
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pintTimeout: 5000,
    cookie: false
});
server.listen(process.env.PORT || config.server_port);

var qiniu = require("qiniu");

app.get('/api/qiniuUpToken', function (req, res) {
    var mac = new qiniu.auth.digest.Mac(config.qiniu_access_key, config.qiniu_secret_key);

    var options = {
        scope: config.qiniu_bucket,
        expires: 12*3600 // 12小时
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    console.log('生成上传密钥: ' + uploadToken);
    res.status(200).send({token: uploadToken});
});

app.get('/api/clearUnusedRooms', function (req, res) {
    dbHelper.clearUnusedRooms(24*3600*1000).then(function () {
        res.status(200).send("Rooms cleared success. ");
    }, function (err) {
        res.status(200).send("No room removed.");
    });
});

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
            io.in(currRoom.roomNo).emit('broadcast', req.msg);
            dbHelper.pushMessage(currRoom.roomNo, req.msg).then (function (room) {
                ack && ack(room.messages);
            });
        });
    });

});