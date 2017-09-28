var types = require("../lib/types");

var helper = {
    init: function (RED, node, config, type_name, valTypes) {
        RED.nodes.createNode(node, config);
        node.log("Gateway: " + JSON.stringify(config.gateway));
        node.gateway = RED.nodes.getNode(config.gateway);
        node.gateway.on("connected", function(cnt) {
            node.status({fill: "green", shape: "dot", text: cnt});
        });
        node.gateway.on("disconnected", function(cnt) {
            node.status({fill: "red", shape: "dot", text: cnt});
        });
        node.msnode = config.msnode || 0;
        node.reqState = config.reqState || true;
        node.switchValue = config.switchValue || false;
        if (node.gateway && typeof(node.msnode) == "string") {
            node.msnode = node.gateway.proxy.nodes[node.msnode];
        }
        node.nodeId = config.nodeId || node.msnode.genId();
        node.name = config.name || type_name + "_" + node.nodeId;
        node.log("set node: " + JSON.stringify(node.msnode));

        node.sensor = node.msnode.addChild(node.nodeId, node.name, types.TYPES[type_name], function () {
            node.gateway.proxy.sendCmd(this.present());
            if (valTypes) {
                for (var i in valTypes) {
                    this.req(valTypes[i]);
                }
                node.reqTimeout = setTimeout(function () {
                    for (i in valTypes) {
                        var valT = valTypes[i];
                        if (this.value[valT] === undefined) {
                            this.value[valT] = 0;
                        }
                        this.setValue(valT, this.value[valT]);
                    }
                }.bind(this), 2000);
            }
        });
        node.on('close', function (removed, done) {
            if (removed) {
                node.msnode.removeChild(node.nodeId);
            }
            done();
        });
        return node.sensor;
    },
    inputEvent: function (RED, node, sensor) {
        node.on('input', function (msg) {
            if (types.SUBTYPES.hasOwnProperty(msg.topic)) {
                var sType = types.SUBTYPES[msg.topic];
                if (sensor.value.hasOwnProperty(sType)) {
                    sensor.setValue(sType, msg.payload);
                }
            }
        });
    }
};

module.exports = helper;