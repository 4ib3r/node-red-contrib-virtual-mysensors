var net = require('net');
var types = require('./types');
var protocol = require("./mysensors_protocol");
const MSG_TYPES = types.MSG_TYPES;
const TYPES = types.TYPES;
const SUBTYPES = types.SUBTYPES;
//const fs = require('fs');
//const path = require('path');
const debugParser = new types.DebugParser;

const VERSION = "2.0";

function parseAddr(data, mode) {
    var nodeId = ("000" + data.nodeId).slice(-3);
    var childId = ("000" + data.childId).slice(-3);
    var style = " ";
    if (mode == 1) style = ">";
    else if (mode == 2) style = "<";
    return style + nodeId + ":" + childId;
}

function Proxy(redNode, host, port) {
    var proxy = this;
    this.port = port;
    this.host = host;
    this.clients = [];
    this.redNode = redNode;
    this.nodes = {
        0: new Node(this, 0, "GatewayJs", {})
    };
    var dataReceived = function (data) {
        var textChunk = data.toString('utf8');
        //log.info("<<", textChunk);
        var data = protocol.parse(textChunk);
        var dbg = debugParser.parse(data);
        if (data.command != 3 && data.type != SUBTYPES.I_HEARTBEAT_REQUEST) {
            redNode.log(parseAddr(data) + " " + dbg.cmd + " " + dbg.type + ": " + data.payload.trim());
        }
        switch (data.command) {
            case MSG_TYPES.INTERNAL:
                this.parseInternal(data);
                break;
            case MSG_TYPES.SET:
                this.parseSet(data);
                break;
            case MSG_TYPES.REQ:
                this.parseIncomingReq(data);
                break;
        }
    };

    this.parseIncomingReq = function (data) {
        var node = this.nodes[data.nodeId];
        if (node == undefined) return;
        var sensor = node.childs[data.childId];
        if (sensor == undefined) return;
        this.redNode.log("req onValueUpdate " + sensor.onValueUpdate.length);
        sensor.value[data.type] = data.payload.trim();
        sensor.onValueUpdate(data.type, data.payload.trim(), function () {
        }, true);
    };

    this.parseSet = function (data) {
        var node = this.nodes[data.nodeId];
        if (node == undefined) return;
        var sensor = node.childs[data.childId];
        if (sensor == undefined) return;
        this.redNode.log("set onValueUpdate " + sensor.onValueUpdate.length);
        sensor.value[data.type] = data.payload.trim();
        if (sensor.onValueUpdate.length >= 3) {
            var cb = function (res) {
                this.sendAck(data);
            }.bind(this);
            sensor.onValueUpdate(data.type, data.payload.trim(), cb);
        } else {
            var res = sensor.onValueUpdate(data.type, data.payload);
            if (typeof res == "boolean" && res) {
                this.sendAck(data);
            }
        }
    };

    this.sendAck = function (data) {
        var ackData = JSON.parse(JSON.stringify(data));
        ackData.ack = true;
        this.sendCmd(data);
    };

    this.close = function (done) {
        this.redNode.status({fill: "red", shape: "ring", text: "disconnected"});
        for (var i in this.clients) {
            this.clients[i].destroy();
        }
        server.close(function (had_error) {
            if (had_error) {
                this.redNode.error("Socket close error: " + had_error);
            }
            done();
        }.bind(this));
    };

    this.parseInternal = function (data) {
        switch (data.type) {
            case SUBTYPES.I_VERSION:
                data.nodeId = 0;
                data.childId = 255;
                data.payload = VERSION;
                this.sendCmd(data);
                this.sendCmd({nodeId: 0, childId: 255, command: 3, type: SUBTYPES.I_CONFIG, payload: ""});
                /*for (var n in this.nodes) {
                 var node = this.nodes[n];
                 for (var c in node.childs) {
                 var sensor = node.childs[c];
                 if (sensor.onConnect != undefined) {
                 this.sendCmd({nodeId: n, childId: c, command: 3, type: SUBTYPES.I_DEBUG, payload: "onConnect"});
                 sensor.onConnect.call(sensor);
                 }
                 }
                 }*/
                break;
            case SUBTYPES.I_HEARTBEAT_REQUEST:
                data.nodeId = 0;
                data.childId = 255;
                data.log = false;
                data.type = SUBTYPES.I_HEARTBEAT_RESPONSE;
                data.payload = "PONG";
                this.sendCmd(data, false);
                break;
        }
    };

    this.presentation = function (id) {
        var node = this.nodes[id];
        var data = {
            nodeId: id,
            childId: 255,
            command: MSG_TYPES.INTERNAL,
            type: SUBTYPES.I_SKETCH_NAME,
            payload: node.name
        };
        this.sendCmd(data);
        data.type = SUBTYPES.I_SKETCH_VERSION;
        data.payload = node.version ? node.version : "1.0";
        this.sendCmd(data);
        this.sendCmd(node.present());
    };

    var server = net.createServer(function (socket) {
        this.clients.push(socket);
        server.emit("client-connected", this.clients.length);
        this.redNode.log("New client");
        socket.on('end', function () {
            var i = this.clients.indexOf(socket);
            this.clients.splice(i, 1);
            server.emit("client-disconnected", this.clients.length);
            this.redNode.log("Client removed");
        }.bind(this));
        socket.on('error', function (err) {
            this.redNode.err("Socket error: " + err);
        }.bind(this));
        socket.on('data', dataReceived.bind(this));
        for (var n in this.nodes) {
            this.presentation(n);
            var node = this.nodes[n];
            for (var c in node.childs) {
                var sensor = node.childs[c];
                if (sensor.onConnect !== undefined && !sensor.initialized) {
                    this.sendCmd({nodeId: n, childId: c, command: 3, type: SUBTYPES.I_DEBUG, payload: "onConnect"});
                    sensor.onConnect.call(sensor);
                    sensor.initialized = true;
                }
                this.sendCmd(node.present(c));
            }
        }
    }.bind(this));

    this.listen = function (fnConn, fnDisconn) {
        server.on('client-connected', fnConn);
        server.on('client-disconnected', fnDisconn);
        server.listen(port, host);
        this.redNode.status({fill: "yellow", shape: "ring", text: "connected"});
        this.redNode.log("Server started on port: " + port);
    };

    this.sensorValueUpdated = function (id, childId, sensor, type, cmd) {
        var val = "";
        if (cmd == 1) val = sensor.value[type];
        else if (cmd == 3) val = sensor.internal[type];
        else val = "1";
        var data = {
            nodeId: id,
            childId: childId,
            command: cmd,
            ack: false,
            type: type,
            payload: "" + val
        };
        proxy.sendCmd(data);
    };

    this.addNode = function (id, name) {
        var n = new Node(this, id, name);
        this.nodes[id] = n;
        return n;
    };

    /*this.addFile = function(id, name, file) {
     try {
     var node = require(file);
     this.nodes[id] = new Node(id, name, node);
     for (var i in node) {
     node[i].updated = this.sensorValueUpdated.bind(this, id, i, node[i])
     //log.info(parseAddr({nodeId: id, childId: i}) + " " + chalk.yellow("REGISTERED") + " " + name + " " + node[i].name);
     }
     } catch (e) {
     //console.error(parseAddr({nodeId: id, childId: 255}) + " " + chalk.yellow("REGISTER") + " " + e);
     }
     };*/

    this.messages = [];

    this.sendCmd = function (data) {
        this.messages.push(JSON.parse(JSON.stringify(data)));
    };

    setInterval(sendFromQueue.bind(this), 10);
    function sendFromQueue() {
        if (this.messages.length) {
            var data = this.messages.shift();
            var str = protocol.send(data);
            //log.info(">>", str);
            if (data.log == undefined || data.log) {
                logMessageToSend.call(this, data);
            }
            for (var i = 0; i < this.clients.length; i++) {
                this.clients[i].write(str + "\n");
            }
        }
    }
};

function Node(proxy, id, name, childs) {
    this.id = id;
    this.name = name;
    this.childs = childs || {};

    this.addChild = function (id, name, type, fn) {
        var sensor = new types.Sensor(name, type, fn);
        sensor.updated = proxy.sensorValueUpdated.bind(this, this.id, id, sensor);
        this.childs[id] = sensor;
        sensor.present = this.present.bind(this, id);
        return sensor;
    };

    this.genId = function () {
        var i = 0;
        while (true) {
            if (!this.childs.hasOwnProperty("" + (++i))) {
                return i;
            }
        }
    };

    this.removeChild = function (id) {
        delete this.childs[id];
    };

    this.present = function (childId) {
        if (childId == undefined) childId = 255;
        var child = this.childs[childId];
        var data = {
            nodeId: this.id,
            childId: childId,
            command: MSG_TYPES.PRESENTATION,
            type: (child == undefined ? TYPES.S_ARDUINO_NODE : child.type),
            payload: (child == undefined ? this.name : child.name)
        };
        return data;
    };
}

function logMessageToSend(data) {
    var mode = 1;
    if (data.ack) mode = 2;
    var dbg = debugParser.parse(data);
    this.redNode.log(parseAddr(data, mode) + " " + dbg.cmd + " " + dbg.type + ": " + data.payload.trim());
}
//var proxy = new Proxy(1880);
//proxy.addAllFromDir(path.join(__dirname, "nodes"));
//proxy.listen();

module.exports = Proxy;