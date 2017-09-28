var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function (RED) {
    function MyDimmer(config) {
        var sensor = Helper.init(RED, this, config, "S_DIMMER",
            [types.SUBTYPES.V_PERCENTAGE, types.SUBTYPES.V_STATUS]);
        var node = this;
        sensor.value[types.SUBTYPES.V_PERCENTAGE] = 0;
        sensor.value[types.SUBTYPES.V_STATUS] = "0";
        Helper.inputEvent(RED, node, sensor);

        sensor.onValueUpdate = function (valType, val, cb, req) {
            var valStatus = null, valDimmer = null;
            if ((req && node.reqState) || !req) {
                var value = parseInt(sensor.value[types.SUBTYPES.V_PERCENTAGE]);
                if (valType == types.SUBTYPES.V_STATUS) {
                    valStatus = {payload: val == "1", topic: "V_STATUS", req: req}
                    if (node.switchValue) {
                        value = (val == "1" ? value : 0);
                        valDimmer = {payload: value, topic: "V_PERCENTAGE", req: req};
                    }
                } else if (valType == types.SUBTYPES.V_PERCENTAGE) {
                    valDimmer = {payload: value, topic: "V_PERCENTAGE", req: req};
                    if (value > 0) {
                        valStatus = {payload: true, topic: "V_STATUS", req: req}
                    }
                }
                node.send([valStatus, valDimmer ]);
            }
            cb();
        };
    }

    RED.nodes.registerType("MyDimmer", MyDimmer);
};