var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function (RED) {
    function MyDoor(config) {
        initConfig(RED, this, config, "S_DOOR");
        var node = this;

        node.on('input', function (msg) {
            var type = null;
            switch (msg.topic) {
                case "I_BATTERY_LEVEL":
                    node.sensor.updateBattery(msg.payload);
                    break;
                default:
                    type = types.SUBTYPES.V_TRIPPED;
                    msg.payload = msg.payload ? 1 : 0;
            }
            if (type !== null) {
                node.sensor.setValue(type, msg.payload);
            }
        });
    }

    RED.nodes.registerType("MyDoor", MyDoor);
};