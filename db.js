const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

function DbHelper(dbUrl,errCallback, sucCallback) {
    mongoose.connect(dbUrl || 'mongodb://localhost/push_text',
        {useMongoClient: true}, function (err, res) {
        if (err) {
            if (typeof errCallback === 'function') {
                errCallback(err);
            }
        } else {
            if (typeof sucCallback === 'function') {
                sucCallback(res);
            }
        }
    });

    /* Create Schema*/
    this.userSchema = new mongoose.Schema({
        name: String
    });
    this.massageSchema = new mongoose.Schema({
        content: String,
        fileUrl: String,
        uid: mongoose.Schema.Types.ObjectId
    });
    this.roomSchema = new mongoose.Schema({
        roomNo: String,
        ownerId: mongoose.Schema.Types.ObjectId,
        messages: [this.massageSchema],
        users: [mongoose.Schema.Types.ObjectId],
        createdTime: {type: Date, default: new Date()}
    });

    this.Room = mongoose.model('rooms', this.roomSchema);
    this.User = mongoose.model('users', this.userSchema);
}

DbHelper.prototype.getUser = function (uid) {
    return this.User.findOne({_id: uid}).exec();
};

DbHelper.prototype.createUser = function (username) {
    var User = this.User;
    var temp = new User({name: username});
    return temp.save();
};

DbHelper.prototype.createAnonyUser = function () {
    return this.createUser("nobody");
};

DbHelper.prototype.deleteUser = function (uid) {
    return this.User.remove({_id: uid}).exec();
};

DbHelper.prototype.clearUsers = function () {
    return this.User.remove({}).exec();
};

DbHelper.prototype.enterRoom = function (roomNumber, userId) {
    var Room = this.Room;

    var p1 = Room.findOne({roomNo: roomNumber}).exec();
    return p1.then(function (room) {
        var p2;
        if (!room) {
            var newRoom = new Room({
                roomNo: roomNumber,
                ownerId: userId,
                messages: [],
                users: [userId]
            });
            p2 = newRoom.save();
        } else {
            room.users.addToSet(userId);
            p2 = room.save();
        }
        return p2;
    })
};

DbHelper.prototype.leaveRoom = function (roomNumber, userId) {
    return this.Room.findOneAndUpdate({roomNo: roomNumber},
        {$pull: {users: new mongoose.mongo.ObjectId(userId)}},{new: true});
};

DbHelper.prototype.getCurrentRoom = function (userId) {
    return this.Room.findOne({users: new mongoose.mongo.ObjectId(userId)}).exec();
};

DbHelper.prototype.clearUnusedRooms = function (someTimeAgo) {
    this.User.remove({}).exec(); // clear users.
    var timeBefore = Date.now() - someTimeAgo;
    return this.Room.deleteMany({createdTime: {$lte: new Date(timeBefore)}}).exec();
};

DbHelper.prototype.pushMessage = function (roomNumber, message) {
    var newMsg = {
        content: message.content,
        fileUrl: message.fileUrl,
        uid: message.uid
    };
    return this.Room.findOneAndUpdate({roomNo: roomNumber},
        {$addToSet: {messages: newMsg}}, {new: true}).exec();
};

module.exports = DbHelper;