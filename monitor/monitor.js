const ewelink = require("ewelink-api");

module.exports = function (RED) {

    function MonitorNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        this.ws = null;
        this.credentials = null;
        this.name = config.name;
        this.account = RED.nodes.getNode(config.account);
        this.account.on("credentialsChanged", data => {
            node.credentials = data;
        });
        node.warn("monitor crated");
        node.warn(this.account);

        this.beginWebSocket = async () => {
            const connection = new ewelink(this.credentials);
            if (connection) {
                node.ws = await connection.openWebSocket(async msg => {
                    node.log(mag);
                });
            }
        }
    }


    RED.nodes.registerType("monitor", MonitorNode);
}

//  
