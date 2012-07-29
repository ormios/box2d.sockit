var http = require('http'), util=require('util');
var port = process.env.PORT || 5000;
console.log('listen:'+ port);

//setup server and hook socket.io to express
var express = require('express'), app=express.createServer(), sio = require('socket.io');

app.get('/', function(request, response) {
  response.send('Hello World! ' + port);
});

app.listen(port, function() {
  console.log("Listening on " + port);
});
var io= sio.listen(app)
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.set('log level', 2); // reduce logging

/*
 ************************************************************************************************************************
 */


 /*
 ************************************************************************************************************************
 */
 
		// The scale between Box2D units and pixels
		var SCALE = 30;

		// Multiply to convert degrees to radians.
		var D2R = Math.PI / 180;

		// Multiply to convert radians to degrees.
		var R2D = 180 / Math.PI;

		// 360 degrees in radians.
		var PI2 = Math.PI * 2;
		
function update() {
	checkJoints();
	world.Step(1 / 60, 8, 3);
	world.ClearForces();
	step(false);	
}

function checkJoints() {
	var _now = +new Date;
	for(var cid in joints) {
		if(joints[cid]) {
			if(joints[cid].t+1000 < _now) {
				deleteJoint(cid);
				deleteJoint(-cid);
			}
		}		
	}
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
io.sockets.emit('step',data);
}

setupWorld();
setInterval(update, 1000 / 60);
 

// SOCKETS
var cidseed=1;
io.sockets.on('connection', function(client) {
	
	var cid=cidseed++;
	console.log("Total clients: " + cidseed);
	
	client.emit("start", {cid: cid, count: bodiesNum});
	step(true);
	
	client.on('restorecid', function(data){
		cid = data.cid;
	});
	client.on('ping', function(data){
		if(joints[data.cid])
			joints[data.cid].t = +new Date;
	});
	client.on('createjoint', function(data){
		createMouseJoint(data.cid, +new Date, data.id, data.x, data.y);	
		console.log('create_joint'+cid+' '+data.cid);		
	});

	client.on('destroyjoint', function(data){
		deleteJoint(data.cid);
		console.log('destroyed_joint'+cid+' '+data.cid);		
	});

	client.on('updatejoint', function(data){
		updateJoint(data.cid, +new Date, data.x, data.y);
		console.log('update_joint'+cid+' '+data.cid);		
	});

	client.on('disconnect', function(client){
		deleteJoint(cid);
		deleteJoint(-cid);
		console.log("disconnect");		
	}); 
	client.on('close', function(client){
		console.log("disconnect");		
	}); 
});
