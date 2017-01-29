import {server, connection, request, IMessage} from "websocket";
import * as _ from "lodash";
import * as http from "http";
import * as events from "events";

export namespace WebSocket {
    var connections: connection[] = [];

    export function createWebSocket(port: number): events.EventEmitter {
        /*==========  = = = = = = = =  =========*/
        /*========== Websocket MOCKING =========*/
        //https://www.npmjs.com/package/nodejs-websocket
        var conns = [];

        let httpServer = http.createServer();
        httpServer.listen(port, ()=> console.log("websocket listening on 8001"));

        let ws = new server(
            {
                httpServer: httpServer,
                autoAcceptConnections: true,
                keepalive: true
            }
        );


        ws.on('request', onRequest);
        ws.on('connect', (connection => {
            console.log("new client on websocket");
            connections.push(connection)
        }));
        return ws;
    }

    function onRequest(request: request) {

        let conn = request.accept('echo-protocol', request.origin);
        console.log("New connection");
        //connections.push(conn);

        conn.on("message", onMessage);

        //on close pass connection object, code and reason to handler
        conn.on("close", (code, reason) => {
            onClose(code, reason, conn)
        })


    }

    function onMessage(message: IMessage) {
        console.log("received " + message);
        //conn.sendText(str);

    }

    function onClose(code, reason, conn: connection) {
        connections = _.without(connections, conn);
        console.log("Connection closed. Remaining: " + connections.length)
    }

    export function sendToAll(message: any) {
        connections.forEach(connection => {
            connection.sendUTF(JSON.stringify(message));
        })
    }

}