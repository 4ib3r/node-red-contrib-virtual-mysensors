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
            if ((req && node.reqState) || !req) {
                var status = sensor.value[types.SUBTYPES.V_STATUS] == "1";
                if (valType == types.SUBTYPES.V_PERCENTAGE && val > 0) {
                    status = true;
                }
                var value = parseInt(sensor.value[types.SUBTYPES.V_PERCENTAGE]);
                if (node.switchValue) {
                    value = (status ? value : 0);
                }
                node.send([
                    {payload: status, topic: "V_STATUS", req: req},
                    {payload: value, topic: "V_PERCENTAGE", req: req}
                ]);
            }
            cb();
        };
    }

    RED.nodes.registerType("MyDimmer", MyDimmer);
};