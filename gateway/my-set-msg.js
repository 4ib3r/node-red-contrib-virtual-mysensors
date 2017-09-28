var types = require("../lib/types");

module.exports = function (RED) {
    function MySetMsg(config) {
        RED.nodes.createNode(this, config);
        this.msType = config.msType;
        var node = this;
        node.on('input', function (msg) {
            if (node.msType !== null) {
                msg.topic = node.msType;
                node.send([msg]);
            }
        });
    }
    RED.nodes.registerType("MySetMsg", MySetMsg);
};