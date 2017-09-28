var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function (RED) {
    function MyHeater(config) {
        var sensor = Helper.init(RED, this, config, "S_HEATER",
            [types.SUBTYPES.V_HVAC_SETPOINT_HEAT, types.SUBTYPES.V_HVAC_FLOW_STATE, types.SUBTYPES.V_STATUS]);
        var node = this;
        sensor.value[types.SUBTYPES.V_STATUS] = "0";
        sensor.value[types.SUBTYPES.V_HVAC_SETPOINT_HEAT] = 0;
        sensor.value[types.SUBTYPES.V_HVAC_FLOW_STATE] = "0";
        Helper.inputEvent(RED, node, sensor);

        sensor.onValueUpdate = function (valType, val, cb, req) {
            var status = sensor.value[types.SUBTYPES.V_STATUS] == "1";
            var setPoint = parseInt(sensor.value[types.SUBTYPES.V_HVAC_SETPOINT_HEAT]);
            var flowState = sensor.value[types.SUBTYPES.V_HVAC_FLOW_STATE];
            if (node.switchValue) {
                setPoint = (status ? setPoint : 0);
                flowState = (status ? flowState : null);
            }
            if ((req && node.reqState) || !req) {
                node.send([
                    {payload: status, topic: "V_STATUS", req: req},
                    {payload: setPoint, topic: "V_HVAC_SETPOINT_HEAT", req: req},
                    {payload: flowState, topic: "V_HVAC_FLOW_STATE", req: req}
                ]);
            }
            cb();
        };

        node.on('input', function (msg) {
            node.sensor.setValue(types.SUBTYPES.V_TEMP, msg.payload);
        });
    }

    RED.nodes.registerType("MyHeater", MyHeater);
};