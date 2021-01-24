import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

export interface ILocation {
  id?: number;
  title: string;
  x: number;
  y: number;
  socketId?: string;
}

export interface ILocationError {
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public locations = this.socket.fromEvent<ILocation[]>('locations');
  public newLocation = this.socket.fromEvent<ILocation>('location-created');
  public editedLocation = this.socket.fromEvent<ILocation>('location-edited');
  public deletedLocation = this.socket.fromEvent<number>('location-deleted');
  public error = this.socket.fromEvent<ILocationError>('locationError');
  
  public constructor(private socket: Socket) {
  }

  public createLocation(location: ILocation) {
    this.socket.emit('create-location', location);
  }

  public editLocation(location: ILocation) {
    if (location.id) {
      this.socket.emit('edit-location', { locationId: location.id, location });
    }
  }

  public deleteLocation(location: ILocation) {
    if (location.id) {
      this.socket.emit('delete-location', { locationId: location.id });
    }
  }
}
