//const EventEmitter = require("events");
const Redwelink = require("./redwelink");
const kEventNameConnectionStatusChanged = "connectionStatusChanged";
const kEventNameWebSocketReceivedMessage = "webSocketReceivedMessage";

const RedwelinkConnectionStatus = {
    none: 0,
    partiallyAvailable: 1,
    available: 2,
    unavailable: 3

};
module.exports = [kEventNameConnectionStatusChanged, RedwelinkConnectionStatus];


module.exports = function (RED) {

    function ConnectionNode(config) {

        RED.nodes.createNode(this, config);

        let node = this;

        const {
            userid = null,
            password = null
        } = this.credentials;

        const {
            region = "us",
            name,
            useridType = "email"
        } = config;

        this.name = name;


        this.userCredentials = {
            region: region,
            password: password,
            [useridType]: userid
        };

        node.log("this.userCredentials = " + this.userCredentials)

        this.client = new Redwelink(this.userCredentials);

        if (this.client.initialized()) {
            node.client.authCredentialsDidChange = credInfo => {
                node.userCredentials.region = credInfo.region;
                config.region = credInfo.region;
                node.authCredentials = credInfo;
                node.emit("authCredentialsChanged", credInfo);
            };

            node.client.webSocketDidReceivedData = data => {
                node.emit("websocketdata", data);
//                node.log(JSON.stringify(data, null, "\t"))
            };
            node.client.reconnect();
            setInterval(async () => {
                node.client.checkConnection();
            }, 30000);

        } else {
            // handle error init
        }

    }

    RED.nodes.registerType("connection", ConnectionNode, {
        credentials: {
            userid: { type: "text" },
            password: { type: "password" }
        }
    });
}