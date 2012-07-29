/**
 * Created with JetBrains WebStorm.
 * User: Jonas
 * Date: 2012-07-29
 * Time: 15:46
 * To change this template use File | Settings | File Templates.
 */
(function (exports) {
    var Box2D = require('./lib/box2d.js');
    /**
     * The game instance that's shared across all clients and the server
     */

    // The scale between Box2D units and pixels
    var SCALE = 30;
    // Multiply to convert degrees to radians.
    var D2R = Math.PI / 180;
    // Multiply to convert radians to degrees.
    var R2D = 180 / Math.PI;
    // 360 degrees in radians.
    var PI2 = Math.PI * 2;

    var b2Vec2 = Box2D.Common.Math.b2Vec2,
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
        b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

    var World = function (params) {
        this.bodiesNum = 90;
        this.world = new b2World(new b2Vec2(0, 10), true);
        this.joints = {};
        this.callbacks = {};

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

        this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        bodyDef.position.Set(10, -1.8);

        this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        fixDef.shape.SetAsBox(2, 14);

        bodyDef.position.Set(-1.8, 13);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        bodyDef.position.Set(21.8, 13);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create some objects
        bodyDef.type = b2Body.b2_dynamicBody;
        var shape;
        for (var i = 0; i < this.bodiesNum; i++) {
            if (i % 2 == 1) {
                shape = BodyShapes.box;
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(0.5, 0.5);
            } else {
                shape = BodyShapes.circle;
                fixDef.shape = new b2CircleShape(0.5);
            }
            bodyDef.position.x = (i % 5 + 1) * 4;
            bodyDef.position.y = 10 - (i + 1) / 5;
            console.log(bodyDef.position);
            bodyDef.userData = {bodyId:i };

            var f = this.world.CreateBody(bodyDef).CreateFixture(fixDef);
            f.m_userData = {w:0.5 * 30, h:0.5 * 30, id:i, s:shape};
        }
    }

    World.prototype.findBody = function (id) {
        for (var nextBody = this.world.GetBodyList(); nextBody; nextBody = nextBody.GetNext()) {
            if (nextBody.GetUserData().bodyId == id) {
                return nextBody;
            }
        }
        return null;
    }

    World.prototype.boydCount = function () {
        return this.bodiesNum;
    }
    World.prototype.createMouseJoint = function (cid, t, id, x, y) {
        if (this.joints[cid]) {
            this.deleteJoint(cid);
        }
        var j = this.createJoint(this.world.GetGroundBody(), this.findBody(id), x, y);
        if (j) {
            this.joints[cid] = {j:j, t:t}; //createMouseJoint(data);
        }
        return j;
    }

    World.prototype.createJoint = function (bodyA, bodyB, x, y) {
        if (bodyA && bodyB) {
            bodyB.SetAwake(true);

            var md = new b2MouseJointDef();
            md.bodyA = bodyA;
            md.bodyB = bodyB;
            md.target.Set(x, y);
            md.collideConnected = true;
            md.maxForce = 300.0 * bodyB.GetMass();
            return this.world.CreateJoint(md);
        }
    }

    World.prototype.deleteJoint = function (cid) {
        //console.log(cid);
        if (this.joints[cid]) {
            if (this.world.IsLocked()) {
                //should probably queue this and do it in update loop
                //console.log('deleteJoint - world is locked.' +cid);
                if (cid > 0)
                    this.joints[-cid] = this.joints[cid];
                setTimeout(function () {
                    this.deleteJoint(-Math.abs(cid), true)  }, 25);
            } else {
                this.world.DestroyJoint(this.joints[cid].j);
            }
            delete this.joints[cid];
        }
    }

    World.prototype.updateJoint = function (cid, t, x, y) {
        if (this.joints.hasOwnProperty(cid)) {
            this.joints[cid].t = t;
            if (x && y) {
                this.joints[cid].j.SetTarget(new b2Vec2(x, y));
            }
        }
    }
    World.prototype.start = function () {
        var ctx = this;
        this.timer = setInterval(function () {
            ctx.checkJoints_();
            ctx.world.Step(1 / 90, 8, 3);
            ctx.world.ClearForces();
            ctx.doStep_();
        }, 1000 / 100);
    }
    World.prototype.stop = function () {
        clearInterval(this.timer);
    }

    World.prototype.doStep_ = function (IncludeSleeping) {
        var data = [this.bodiesNum], i = 0;
        for (var b = this.world.m_bodyList; b; b = b.m_next) {
            if (b.IsAwake() || IncludeSleeping) {
                for (var f = b.m_fixtureList; f; f = f.m_next) {
                    if (f.m_userData) {
                        var x = Math.floor(((f.m_body.m_xf.position.x * 30)) - f.m_userData.w);
                        var y = Math.floor(((f.m_body.m_xf.position.y * 30)) - f.m_userData.h);
                        //x -= offsetX;
                        //y -= offsetY;
                        //console.log(x +', ' +y);
                        //CSS3 transform does not like negative values or infinite decimals
                        var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
                        data[i++] = {id:f.m_userData.id, x:x, y:y, r:r, w:f.m_userData.w, h:f.m_userData.h, s:f.m_userData.s};
                        //console.log(data[i-1]);
                    }
                }
            }
        }
        if (i > 0)
            this.callback_('step', data);
    }

    World.prototype.checkJoints_ = function () {
        var _now = +new Date;
        for (var cid in this.joints) {
            if (this.joints[cid]) {
                if (this.joints[cid].t + 1000 < _now) {
                    this.deleteJoint(cid);
                    this.deleteJoint(-cid);
                }
            }
        }
    }
    /**
     *
     */
    World.prototype.callback_ = function (event, data) {
        var callback = this.callbacks[event];
        if (callback) {
            callback(data);
        } else {
            throw "Warning: No callback defined!";
        }
    };

    /**
     * Deterministically generate new ID for an object
     World.prototype.newId_ = function() {
     return ++this.lastId;
     };
     */

    /**
     *
     */
    World.prototype.on = function (event, callback) {
        // Sample usage in a client:
        //
        // game.on('dead', function(data) {
        //   if (data.id == player.id) {
        //     // Darn -- player died!
        //   }
        // });
        this.callbacks[event] = callback;
    };
    var BodyShapes = { box:0, circle:1, poly:3};
    var Body = function (body) {
        this.x = body.x;
        this.y = body.y;
        this.w = body.w;
        this.h = body.h;
        this.c = body.c;
        this.s = body.s;
    }
    exports.World = World;
    exports.Body = Body;
    exports.BodyShapes = BodyShapes;
})(typeof global === "undefined" ? window : exports);
