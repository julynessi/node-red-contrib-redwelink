module.exports = function (RED) {

    function EventInNode(config) {

        RED.nodes.createNode(this, config);

        this.status({ color: "red", shape: "ring", text: "offline" });

        let node = this;
        this.name = config.name;
        this.topic = config.topic;
        this.connection = RED.nodes.getNode(config.connection);

        if (this.connection) {
            this.connection.on("authCredentialsChanged", data => {
                node.authCredentials = data;
                node.status({ fill: "green", shape: "dot", text: "online" });
            });

            this.connection.on("websocketdata", data => {
                node.send({ fill: node.topic, payload: data });
            });


        }
    }
    RED.nodes.registerType("eventin", EventInNode);
}