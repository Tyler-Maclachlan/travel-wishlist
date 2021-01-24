import { Application } from 'express';
import { Server } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { ILocation } from './app';

import { LambdaManager } from "./lambdaService";
import { createLocation, createUser, ICreateUserArgs, editLocation, deleteLocation, getLocations, IGetLocationsArgs } from './lambdas';

export class SocketServer {
    private _ioServer: IOServer;
    private _httpServer: Server;
    private _lambdaManager: LambdaManager;

    public constructor(app: Application)  {
        this._httpServer = new Server(app);

        this._httpServer;

        this._ioServer = require('socket.io')(this._httpServer);

        this._lambdaManager = new LambdaManager();

        this.config();
    }

    public listen(port = 3001) {
        this._httpServer.listen(port, () => {
            console.log(`Listening on port: ${port}`);
        })
    }

    private registerLambdas() {
        this._lambdaManager.registerLambda('createUser', createUser);
        this._lambdaManager.registerLambda('createLocation', createLocation);
        this._lambdaManager.registerLambda('getLocations', getLocations);
        this._lambdaManager.registerLambda('editLocation', editLocation);
        this._lambdaManager.registerLambda('deleteLocation', deleteLocation);
    }

    private config() {
        this._ioServer.on('connection', this._onConnection.bind(this));
        this.registerLambdas();
    }

    private async _onConnection(socket: Socket) {
        try {
            const socketId = socket.id;
            await this._lambdaManager.invokeLambda<ICreateUserArgs>('createUser', { socketId });
            const locations = await this._lambdaManager.invokeLambda<IGetLocationsArgs>('getLocations', { socketId });
            socket.emit('locations', locations);
        } catch (error) {
            console.log(error);
            socket.emit('locationError', { error: error.message });
        }
        this._setupSocket(socket);
    }

    private _setupSocket(socket: Socket) {
        const socketId = socket.id;
        socket.on('create-location', async (location: ILocation) => {
            try {
                const newLocation = await this._lambdaManager.invokeLambda('createLocation', { location }, { socketId })
                socket.emit('location-created', newLocation);
            } catch (error) {
                socket.emit('locationError', { error: error.message });
            }
        });
        socket.on('edit-location', async ({ locationId, location }: { locationId: number, location: ILocation }) => {
            try {
                const editedLocation = await this._lambdaManager.invokeLambda('editLocation', { locationId, location }, { socketId })
                socket.emit('location-edited', editedLocation);
            } catch (error) {
                socket.emit('locationError', { error: error.message });
            }
        });
        socket.on('delete-location', async ({ locationId }: { locationId: number }) => {
            try {
                await this._lambdaManager.invokeLambda('deleteLocation', { locationId }, { socketId })
                socket.emit('location-deleted', locationId);
            } catch (error) {
                socket.emit('locationError', { error: error.message });
            }
        });
    }
}