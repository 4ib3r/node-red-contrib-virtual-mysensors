var types = require("../lib/types");
var initConfig = require('./sensor-helper').init;

module.exports = function (RED) {
    function MyDoor(config) {
        initConfig(RED, this, config, "S_DOOR");
        var node = this;

        node.on('input', function (msg) {
            var type;
            switch (msg.topic) {
                case "I_BATTERY_LEVEL": type = types.SUBTYPES.I_BATTERY_LEVEL; break;
                default: 
                    type = types.SUBTYPES.V_TRIPPED;
                    msg.payload = msg.payload ? 1 : 0;
            }
            node.sensor.setValue(type, msg.payload);
        });
    }

    RED.nodes.registerType("MyDoor", MyDoor);
};