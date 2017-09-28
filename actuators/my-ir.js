var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function(RED) {
    function MyIR(config) {
        var sensor = Helper.init(RED, this, config, "S_IR");
        var node = this;
        node.record = -1;
        node.on("input", function(msg) {
            msg.payload = parseInt(msg.payload);
            if (isNaN(msg.payload)) {
                node.error("payload is not int");
            } else {
                node.sensor.setValue(types.SUBTYPES.V_IR_RECEIVE, msg.payload);
            }
        });

        sensor.onValueUpdate = function(valType, val, cb, req) {
            if ((req && node.reqState) || !req) {
                if (valType == types.SUBTYPES.V_IR_SEND) {
                    node.send({payload: val, topic: "V_IR_SEND", req: req});
                } else if (valType == types.SUBTYPES.V_IR_RECORD) {
                    node.sensor.setValue(types.SUBTYPES.V_IR_RECORD, 1);
                    node.status({fill: "yellow", shape: "dot", text: "IR_RECORD: " + val});
                    node.record = val;
                    setTimeout(function() {
                        node.sensor.setValue(types.SUBTYPES.V_IR_RECORD, 1);
                        node.status({});
                        node.record = -1;
                    }, 30000)
                }
            }
            cb();
        };
    }
    RED.nodes.registerType("MyIR", MyIR);
};