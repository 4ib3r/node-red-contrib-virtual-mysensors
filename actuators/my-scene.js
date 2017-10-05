var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function(RED) {
    function MyScene(config) {
        var sensor = Helper.init(RED, this, config, "S_SCENE_CONTROLLER",
            [types.SUBTYPES.V_SCENE_ON]);
        var node = this;
        Helper.inputEvent(RED, node, sensor, function(msg) {
            var val = parseInt(msg.topic);
            if (isNaN(val)) {
                val = 0;
            }
            sensor.setValue((msg.payload ? types.SUBTYPES.V_SCENE_ON : types.SUBTYPES.V_SCENE_OFF), val, true);
        });
    }
    RED.nodes.registerType("MyScene", MyScene);
};