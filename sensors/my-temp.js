var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function (RED) {
    function MyTemperature(config) {
        initConfig(RED, this, config, "S_TEMP");
        var node = this;
        node.sensor.setValue(types.SUBTYPES.V_ID, this.id);

        node.on('input', function (msg) {
            var type = null;
            switch (msg.topic) {
                case "I_BATTERY_LEVEL": 
                    node.sensor.updateBattery(msg.payload);
                    break;
                case "V_ID": type = types.SUBTYPES.V_ID; break;
                default:
                    type = types.SUBTYPES.V_TEMP;
            }
            if (type !== null) {
                node.sensor.setValue(type, msg.payload);
            }
        });
    }

    RED.nodes.registerType("MyTemperature", MyTemperature);
};