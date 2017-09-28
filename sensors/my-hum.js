var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function(RED) {
    function MyHumidity(config) {
        initConfig(RED, this, config, "S_HUM");
        var node = this;

        node.on('input', function (msg) {
            var type = types.SUBTYPES.V_HUM;
            switch (msg.topic) {
                case "V_TEMP": type = types.SUBTYPES.V_TEMP; break;
                case "I_BATTERY_LEVEL": type = types.SUBTYPES.I_BATTERY_LEVEL; break;
            }
            node.sensor.setValue(type, msg.payload);
        });
    }
    RED.nodes.registerType("MyHumidity", MyHumidity);
};