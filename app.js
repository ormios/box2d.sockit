var http = require('http'), util=require('util');
var port = process.env.PORT || 5000;
console.log('listen:'+ port);

//setup server and hook socket.io to express
var express = require('express'), app=express.createServer(), sio = require('socket.io');
var app = express.createServer(express.logger());

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
  io.set("close timeout", 30);
});

//io.set('log level', 1); // reduce logging

var Box2D = require('./lib/box2d.js');

/*
 ************************************************************************************************************************
 */

var bodiesNum = 30;
var world;

var	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2AABB = Box2D.Collision.b2AABB,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2World = Box2D.Dynamics.b2World,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

function setupWorld() {
	world = new b2World(new b2Vec2(0, 10), true);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.35;
	fixDef.restitution = 0.4;
		 
	var bodyDef = new b2BodyDef;
		 
	// create ground
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(20, 2);

	bodyDef.position.Set(10, 400 / 30 + 1.8);

	world.CreateBody(bodyDef).CreateFixture(fixDef);
	bodyDef.position.Set(10, -1.8);

	world.CreateBody(bodyDef).CreateFixture(fixDef);
	fixDef.shape.SetAsBox(2, 14);

	bodyDef.position.Set(-1.8, 13);
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	bodyDef.position.Set(21.8, 13);
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	// create some objects
	bodyDef.type = b2Body.b2_dynamicBody;

	for(var i = 0; i < bodiesNum; i++) {
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(0.5, 0.5);
	
		bodyDef.position.x = (i%5 + 1) * 4;
		bodyDef.position.y = 10- (i+1) / 5 ;
		console.log(bodyDef.position);
		bodyDef.userData = {"bodyId" : parseInt(i) };

		var f = world.CreateBody(bodyDef).CreateFixture(fixDef);
		f.m_userData = {w: 0.5*30, h: 0.5 * 30, id: i};		
	}
}

var joints = {};

function getJointData(j) {
	var data = {};

	data.x = j.GetTarget().x;
	data.y = j.GetTarget().y;

	data.bodyId = j.GetBodyB().GetUserData().bodyId;

	return data;
}

function findBody(index) {
	var body = null;

	var nextBody = world.GetBodyList();
	for (var i = 0; i < bodiesNum; i++) {
		if (nextBody.GetUserData().bodyId == index) { body = nextBody; break; }
		nextBody = nextBody.GetNext();
	}

	return body;
}

function createMouseJoint(cid, id, x, y) {
	var j = createJoint(world.GetGroundBody(), findBody(id), x, y);
	if(j)
		joints[cid] = j; //createMouseJoint(data);		
	return j;
}

function createJoint(bodyA, bodyB, x, y) {	
	if(bodyA && bodyB) {
	bodyB.SetAwake(true);

	var md = new b2MouseJointDef();
	md.bodyA = bodyA;
	md.bodyB = bodyB;
	md.target.Set(x, y);
	md.collideConnected = true;
	md.maxForce = 300.0 * bodyB.GetMass();
	return world.CreateJoint(md);
	}
}

function deleteJoint(cid) {
	console.log(cid);
	if(joints[cid]) {
		if(world.IsLocked()) {
		  //should probably queue this and do it in update loop
		  setTimeout(function() { deleteJoint(cid, true)}, 25);
		} else {
			world.DestroyJoint(joints[cid]);
   		    delete joints[cid];
		}
	}
}

function updateJoint(cid, x, y) {
	if(joints.hasOwnProperty(cid)) 
		joints[cid].SetTarget(new b2Vec2(x, y));
}

 /*
 ************************************************************************************************************************
 */
 
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
	world.Step(1 / 60, 8, 3);
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
	var cid=clients.length;
	console.log("Total clients: " + clients.length);
	
	client.emit("start", {cid: clients.length, count: bodiesNum});
	step(true);
	
	client.on('restorecid', function(data){
		cid = data.cid;
	});
	client.on('createjoint', function(data){
		createMouseJoint(data.cid, data.id, data.x, data.y);	
	});

	client.on('destroyjoint', function(data){
		deleteJoint(data.cid);
		console.log('destroyed_joint');		
	});

	client.on('updatejoint', function(data){
		updateJoint(data.cid, data.x, data.y);
		console.log('update');		
	});

	client.on('disconnect', function(client){
		clients.pop(client);
		console.log("disconnect");		
	}); 
	client.on('close', function(client){
		clients.pop(client);
		console.log("disconnect");		
	}); 
});
