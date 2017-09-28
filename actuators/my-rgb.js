var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function (RED) {
    function MyRgb(config) {
        var sensor = Helper.init(RED, this, config, "S_RGB_LIGHT",
            [types.SUBTYPES.V_RGB, types.SUBTYPES.V_STATUS, types.SUBTYPES.V_PERCENTAGE]);
        var node = this;
        sensor.value[types.SUBTYPES.V_RGB] = "000000";
        sensor.value[types.SUBTYPES.V_PERCENTAGE] = 0;
        sensor.value[types.SUBTYPES.V_STATUS] = "0";
        Helper.inputEvent(RED, node, sensor);

        sensor.onValueUpdate = function (valType, val, cb, req) {
            var status = sensor.value[types.SUBTYPES.V_STATUS] == "1";
            var dimm = parseInt(sensor.value[types.SUBTYPES.V_PERCENTAGE]);
            var color = sensor.value[types.SUBTYPES.V_RGB];
            if (node.switchValue) {
                dimm = (status ? dimm : 0);
                color = (status ? color : "000000");
            }
            node.send([
                {payload: status , topic: "V_STATUS", req: req},
                {payload: dimm, topic: "V_PERCENTAGE", req: req},
                {payload: color, topic: "V_RGB", req: req}
            ]);
            cb();
        };
    }

    RED.nodes.registerType("MyRgb", MyRgb);
};