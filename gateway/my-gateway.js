var TcpProxy = require('../lib/tcp_proxy');
var types = require('../lib/types');

module.exports = function (RED) {
    function MyGateway(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host || '0.0.0.0';
        this.port = n.port || 5555;
        this.ms_nodes = n.ms_nodes || [];
        this.proxy = new TcpProxy(this, this.host, this.port);
        for (var i = 0; i < this.ms_nodes.length; i++) {
            var msn = this.ms_nodes[i];
            this.ms_nodes[i] = this.proxy.addNode(msn.id, msn.name);
        }
        this.proxy.listen();
        this.on('close', function (removed, done) {
            this.proxy.close(done);
        }.bind(this));
    }

    RED.nodes.registerType("MyGateway", MyGateway);

    RED.httpAdmin.get('/mysensors/id/:id', RED.auth.needsPermission('mysensors.read'), function (req, res) {
        var gateway = RED.nodes.getNode(req.params.id);
        if (gateway == null) {
            res.json("null");
        } else {
            res.json(gateway.ms_nodes);
        }
    });
    RED.httpAdmin.get('/mysensors/node/:id/:node', RED.auth.needsPermission('mysensors.read'), function (req, res) {
        var gateway = RED.nodes.getNode(req.params.id);
        var node = gateway.proxy.nodes[req.params.node];
        res.json({id: node.genId()});
    });
    RED.httpAdmin.get('/mysensors/types', RED.auth.needsPermission('mysensors.read'), function (req, res) {
        //var gateway = RED.nodes.getNode(req.params.id);
        //var node = gateway.proxy.nodes[req.params.node];
        res.json(types.SUBTYPES);
    });
};