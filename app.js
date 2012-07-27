var http = require('http'), sys = require("sys"), fs = require('fs'), util=require('util');
var io = require('socket.io').listen(1337);
io.set('log level', 1); // reduce logging
var Box2D = require('./lib/box2d.js');

eval(fs.readFileSync('common.js') + '');

var clients = [];
		// The scale between Box2D units and pixels
		var SCALE = 30;

		// Multiply to convert degrees to radians.
		var D2R = Math.PI / 180;

		// Multiply to convert radians to degrees.
		var R2D = 180 / Math.PI;

		// 360 degrees in radians.
		var PI2 = Math.PI * 2;
		
function update() {
	world.Step(1 / 60, 10, 10);
	world.ClearForces();
	step(false);
}
function step( IsSleeping) {
	var data=[3], i=0; 
	for (var b = world.m_bodyList; b; b = b.m_next) {
		if(b.IsAwake() || IsSleeping) {
		for (var f = b.m_fixtureList; f; f = f.m_next) {
			if (f.m_userData) {
				var x = Math.floor(((f.m_body.m_xf.position.x * 30)) - f.m_userData.w);
				var y = Math.floor(((f.m_body.m_xf.position.y * 30)) - f.m_userData.h);
				//x -= offsetX;
				//y -= offsetY;
				//console.log(x +', ' +y);
				//CSS3 transform does not like negative values or infitate decimals
				var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;				
				data[i++] = {id: f.m_userData.id, x: x, y: y, r: r, w: f.m_userData.w, h: f.m_userData.h};
				//console.log(data[i-1]);
			}
		}
		}
	}
	if(i>0)
		stepToClients(data);
}

function stepToClients(data) {
	for (var i = 0; i < clients.length; i++) {
		clients[i].emit("step", data);
	}
}

setupWorld();
setInterval(update, 1000 / 60);

// SOCKETS


io.sockets.on('connection', function(client) {
	clients.push(client);
	console.log("Total clients: " + clients.length);
	
	client.emit("start", {cid: clients.length, count: bodiesNum});
	step(true);
	
	client.on('create', function(data){
		createMouseJoint(data.cid, data.id, data.x, data.y);	
	});

	client.on('destroy', function(data){
		deleteJoint(data.cid);
		console.log('destroyed');		
	});

	client.on('update', function(data){
		updateJoint(data.cid, data.x, data.y);
		console.log('update');		
	});

	client.on('disconnect', function(client){
		clients.pop(client);
		console.log("disconnect");		
	}); 
});
