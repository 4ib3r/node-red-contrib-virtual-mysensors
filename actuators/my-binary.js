var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function(RED) {
    function MyBinary(config) {
        var sensor = Helper.init(RED, this, config, "S_BINARY",
            [types.SUBTYPES.V_STATUS]);
        var node = this;
        Helper.inputEvent(RED, node, sensor);

        sensor.onValueUpdate = function(valType, val, cb, req) {
            if ((req && node.reqState) || !req) {
                if (valType == types.SUBTYPES.V_STATUS) {
                    node.send({payload: val == "1", topic: "V_STATUS", req: req});
                }
            }
            cb();
        };
    }
    RED.nodes.registerType("MyBinary", MyBinary);
};