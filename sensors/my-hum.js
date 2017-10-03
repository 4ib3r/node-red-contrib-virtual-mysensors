var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function(RED) {
    function MyHumidity(config) {
        initConfig(RED, this, config, "S_HUM");
        var node = this;

        node.on('input', function (msg) {
            var type;
            switch (msg.topic) {
                case "I_BATTERY_LEVEL": type = types.SUBTYPES.I_BATTERY_LEVEL; break;
                case "V_TEMP": type = types.SUBTYPES.V_TEMP; break;
                default:
                    type = types.SUBTYPES.V_HUM;
                    msg.payload = msg.payload ? 1 : 0;
            }
            node.sensor.setValue(type, msg.payload);
        });
    }
    RED.nodes.registerType("MyHumidity", MyHumidity);
};