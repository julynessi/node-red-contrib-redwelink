
const ewelink = require("ewelink-api");

class Redwelink {
    constructor(params) {
        this.ws = null;
        this.status = "disconnected";
        this.credentials = {};
        this.authCredentials = null;
        this.connectionInfo = params;
        this.reconnecting = false;
        try {
            this.connection = new ewelink(params);
        } catch (error) {
            console.error(error);
            this.connection = null;
        }

        this.authCredentialsDidChange = null;
        this.webSocketDidReceivedData = null;
    };

    initialized() {
        return this.connection !== null;
    }


    reconnect() {
        this.reconnecting = true;

        if (!this.connection) return;

        if (this.ws !== null) {
            this.ws.close();
            this.ws = null;
        }
        
        let objThis = this;
        (async () => {
            if (!objThis.authCredentials) {
                let credentials = await objThis.connection.getCredentials();
                if (credentials) {
                    objThis.authCredentials = {
                        at: credentials.at,
                        region: credentials.region
                    };
                };
                objThis.authCredentialsDidChange(objThis.authCredentials);

                objThis.ws = await objThis.connection.openWebSocket(async data => {
                    if (data === "pong") {

                    } else if (data.hasOwnProperty("error")) {
                        switch (data.error) {
                            case 0:
                                console.log("websocket connected error = 0")
                                objThis.reconnecting = false;
                                break;
                            default: break;
                        }
                    } else {
                        if (objThis.webSocketDidReceivedData) {
                            objThis.webSocketDidReceivedData(data);
                        }
                    }
                });

                if (objThis.ws) {
                    objThis.ws.onOpen.addListener(msg => {
                        console.log("websocket on open\n" + JSON.stringify(msg, null, "\t"));
                    });

                    objThis.ws.onClose.addListener(msg => {
                        console.log("websocket on close\n" + JSON.stringify(msg, null, "\t"));
                    });

                    objThis.ws.onError.addListener(msg => {
                        console.log("websocket on error\n" + JSON.stringify(msg, null, "\t"));
                    });
                }
                
                if (objThis.authCredentialsDidChange) {
                    objThis.authCredentialsDidChange(objThis.authCredentials);
                }
            }
        })();
    }

    checkConnection() {
        if (!this.reconnecting && 
            (!this.authCredentials || !this.ws || !this.ws.isOpened)) {
            this.reconnect();
        }
    };

    disconnect() {
        if (this.ws !== null && this.ws.isOpened) {
            this.ws.close();
            this.ws = null;
        }
    };

};

module.exports = Redwelink; 