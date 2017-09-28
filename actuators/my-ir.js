var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function(RED) {
    function MyIR(config) {
        var sensor = Helper.init(RED, this, config, "S_IR");
        var node = this;
        node.on("input", function(msg) {
            node.sensor.setValue(types.SUBTYPES.V_IR_RECEIVE, msg.payload);
        });

        sensor.onValueUpdate = function(valType, val, cb, req) {
            if ((req && node.reqState) || !req) {
                if (valType == types.SUBTYPES.V_IR_SEND) {
                    node.send({payload: val, topic: "V_IR_SEND", req: req});
                }
            }
            cb();
        };
    }
    RED.nodes.registerType("MyIR", MyIR);
};