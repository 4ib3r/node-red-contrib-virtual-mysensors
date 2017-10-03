var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function(RED) {
    function MyHumidity(config) {
        initConfig(RED, this, config, "S_HUM");
        var node = this;

        node.on('input', function (msg) {
            var type = null;
            switch (msg.topic) {
                case "I_BATTERY_LEVEL":
                    node.sensor.updateBattery(msg.payload);
                    break;
                case "V_TEMP": type = types.SUBTYPES.V_TEMP; break;
                default:
                    type = types.SUBTYPES.V_HUM;
            }
            if (type !== null) {
                node.sensor.setValue(type, msg.payload);
            }
        });
    }
    RED.nodes.registerType("MyHumidity", MyHumidity);
};