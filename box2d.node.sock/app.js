/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path')
    , sio = require('socket.io')
    , worldjs = new require('./world.js');


var app = express();

var World = worldjs.World;
var world = new World();

app.configure('development', function () {
    app.use(express.errorHandler());
});

//app.get('/', routes.index);
app.get('/', function (request, response) {
    response.send('Hello World! ');
});

app.configure(function () {
//    server.use('/css', express.static(__dirname + '/css'));
//    server.use(express.static(__dirname + '/html'));
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // server.use(express.favicon());
//    server.use(express.logger('dev'));
//    server.use(express.bodyParser());
//    server.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});
//app.createServer();
var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
var io = sio.listen(server)
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});


world.on('step', function (data) {
    io.sockets.emit('step', data);
});

io.set('log level', 2); // reduce logging

// SOCKETS
var cidseed = 1;
io.sockets.on('connection', function (client) {
    var cid = cidseed++;
    console.log("Total clients: " + cidseed);

    client.emit("start", {cid:cid, count:world.bodiesNum});

    world.doStep_(true);

    client.on('restorecid', function (data) {
        cid = data.cid;
    });
    client.on('ping', function (data) {
        world.updateJoint(cid, +new Date)
//        if(joints[data.cid])
//            joints[data.cid].t = +new Date;
    });
    client.on('createjoint', function (data) {
        world.createMouseJoint(data.cid, +new Date, data.id, data.x, data.y);
        console.log('create_joint' + cid + ' ' + data.cid);
    });

    client.on('destroyjoint', function (data) {
        world.deleteJoint(data.cid);
        console.log('destroyed_joint' + cid + ' ' + data.cid);
    });

    client.on('updatejoint', function (data) {
        world.updateJoint(data.cid, +new Date, data.x, data.y);
        console.log('update_joint' + cid + ' ' + data.cid);
    });

    client.on('disconnect', function (client) {
        world.deleteJoint(cid);
        world.deleteJoint(-cid);
        console.log("disconnect");
    });
    client.on('close', function (client) {
        console.log("disconnect");
    });
});

world.start();
