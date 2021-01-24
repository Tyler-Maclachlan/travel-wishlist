import "reflect-metadata";
import {createConnection} from "typeorm";
import { SocketServer } from './socketServer';

import App from './app';
import { Socket } from "socket.io";

createConnection()
    .then(async () => {
        const server = new SocketServer(App);

        server.listen();
    })
    .catch(error => console.log(error));
