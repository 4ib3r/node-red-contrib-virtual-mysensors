var types = require("../lib/types");
var helper = require('./sensor-helper');

module.exports = function(RED) {
    function MyBarometer(config) {
        helper.init(RED, this, config, "S_BARO");
        var node = this;

        node.on('input', function (msg) {
            var type = null;
            switch (msg.topic) {
                case "I_BATTERY_LEVEL":
                    node.sensor.updateBattery(msg.payload);
                    break;
                case "V_TEMP": type = types.SUBTYPES.V_TEMP; break;
                case "V_HUM": type = types.SUBTYPES.V_HUM; break;
                case "V_FORECAST": type = types.SUBTYPES.V_FORECAST; break;
                default:
                    type = types.SUBTYPES.V_HUM;
            }
            if (type !== null) {
                node.sensor.setValue(type, msg.payload);
            }
        });
    }
    RED.nodes.registerType("MyBarometer", MyBarometer);
};