var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function(RED) {
    function MyBarometer(config) {
        initConfig(RED, this, config, "S_BARO");
        var node = this;

        node.on('input', function (msg) {
            node.sensor.setValue(types.SUBTYPES.V_PRESSURE, msg.payload);
        });
    }
    RED.nodes.registerType("MyBarometer", MyBarometer);
};