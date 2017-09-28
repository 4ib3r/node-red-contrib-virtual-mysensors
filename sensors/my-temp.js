var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function (RED) {
    function MyTemperature(config) {
        initConfig(RED, this, config, "S_TEMP");
        var node = this;
        node.sensor.setValue(types.SUBTYPES.V_ID, this.id);

        node.on('input', function (msg) {
            node.sensor.setValue(types.SUBTYPES.V_TEMP, msg.payload);
        });
    }

    RED.nodes.registerType("MyTemperature", MyTemperature);
};