
// RedWelinkNodeStatus = {
//     disconnected: {
//         color: "red",
//         shape: "dot",
//         text: "disconnected"
//     },
//     connected: {
//         color: "green",
//         shape: "dot",
//         text: "connected"
//     },
//     none: {
//         color: "grey",
//         shape: "ring",
//         text: "idle"
//     },
//     online: {
//         color: "green",
//         shape: "dot",
//         text: "online"
//     },
//     offline: {
//         color: "red",
//         shape: "dot",
//         text: "disconnected"
//     }
// }; 



module.exports = function (RED) {
    function DevicesNode(config) {

        RED.nodes.createNode(this, config);
        this.status({ color: "red", shape: "ring", text: "offline" });
        let node = this;
        this.credentials = null;
        this.connection = RED.nodes.getNode(config.connection);

        if (this.connection) {
            this.connection.on("authCredentialsChanged", credInfo => {
                if (credInfo) {
                    node.credentials = credInfo;
                    node.status({
                        color: "green",
                        shape: "dot",
                        text: "online"
                    });
                    node.sendDevices();
                }
            });
        }
        else {
            node.status({
                color: "red",
                shape: "ring",
                text: "offline"
            });
        }


        this.sendDevices = () => {
            if (!node.credentials) return;

            (async () => {
                const c = new ewelink(node.credentials);
                const devices = await c.getDevices();

                if (devices) {
                    node.send({ payload: devices });
                }
            });
        };

        this.on("input", msg => {
            node.sendDevices();
        });
    }

    RED.nodes.registerType("devices", DevicesNode);
}
