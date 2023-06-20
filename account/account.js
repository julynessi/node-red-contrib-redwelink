const ewelink = require("ewelink-api");

module.exports = function (RED) {

    function AccountNode(config) {

        RED.nodes.createNode(this, config);
        let node = this;

        this.ws = null;
        this.ewelinkCredentials = null;
        this.connection = null;
        this.name = config.name;
        this.region = "us";
        this.accountIdType = config.accountIdType;
        this.connectionState = "";

        this.changeewelinkCredentials = info => {
            node.ewelinkCredentials = info;
            node.emit("credentialsChanged", info);
        };

        this.requestCredential = async params => {
            let connection = null;
            try {
                connection = new ewelink(params);
            } catch (e) {
                node.error(e.name, e.message);
                connection = null;
            }

            if (!connection) {
               

                return;
            } 

            const cred = await connection.getCredentials();
            if (cred) {
                node.region = cred.region;
                node.changeewelinkCredentials(cred);
            }
        }

        let connParams = {
            region: this.region,
            password: this.credentials.password,
            [this.accountIdType]: this.credentials.accountId
        };

        (async () => {

            try {
                node.connection = new ewelink(connParams);
            } catch (e) {
                node.error(e.name, e.message);
            }

            if (node.connection) {
                let credObj = await node.connection.getCredentials();
                if (credObj) {
                    node.region = credObj.region;
                    node.changeewelinkCredentials({
                        region: credObj.region,
                        at: credObj.at
                    });
                }
            }



        })();








    }


    RED.nodes.registerType("account", AccountNode, {
        credentials: {
            accountId: { type: "text", require: true },
            password: { type: "password", require: true }
        }
    });
}

