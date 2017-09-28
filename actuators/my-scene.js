var types = require("../lib/types");
var Helper = require('./../sensors/sensor-helper');

module.exports = function(RED) {
    function MyScene(config) {
        var sensor = Helper.init(RED, this, config, "S_SCENE_CONTROLLER",
            [types.SUBTYPES.V_SCENE_ON, types.SUBTYPES.V_SCENE_OFF]);
        var node = this;
        Helper.inputEvent(RED, node, sensor);

        sensor.onValueUpdate = function(valType, val, cb, req) {
            if ((req && node.reqState) || !req) {
                if (valType == types.SUBTYPES.V_SCENE_ON) {
                    node.send([{payload: val, topic: "V_SCENE_ON", req: req}, null]);
                }
                if (valType == types.SUBTYPES.V_SCENE_OFF) {
                    node.send([null, {payload: val, topic: "V_SCENE_OFF", req: req}]);
                }
            }
            cb();
        };
    }
    RED.nodes.registerType("MyScene", MyScene);
};