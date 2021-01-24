import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tileLayer, latLng, marker, Layer, LeafletMouseEvent, Map as LMap, map as lMap, icon as lIcon, Icon } from 'leaflet';

import { ApiService, ILocation } from '../api.service';

type EventHandler = (evt?: any) => void;

interface IconOptions {
  iconAnchor: [number, number],
  iconSize: [number, number],
  mapIcon: string;
  mapShadowIcon: string;
  shadowSize: [number, number ],
  shadowAnchor: [number, number ],
}

const MapIconOptions: IconOptions = {
  iconAnchor: [0, 42],
  iconSize: [25, 42],
  mapIcon: './assets/maps/marker-icon.png',
  mapShadowIcon: './assets/maps/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [0, 41],
};

@Component({
  selector: 'app-travel-map',
  templateUrl: './travel-map.component.html',
  styleUrls: ['./travel-map.component.scss']
})
export class TravelMapComponent implements OnInit, OnDestroy, AfterViewInit {
  public locations: ILocation[] = [];
  public error: string = '';
  public markers: Layer[] = [];

  public currentWidth: number;
  public currentHeight: number;

  private _map: LMap;
  private _baseLayer: Layer;
  private _mapLoaded = false;
  private _currentLocation: { x: number, y: number };
 
  @ViewChild('primaryMap', { static: true }) private _mapDivRef: ElementRef;
  private _mapDiv: HTMLDivElement;

  public dialogLocation: ILocation = null;
  public dialogOpen = false;

  private _locationsSub: Subscription;
  private _errorSub: Subscription;
  private _locationCreatedSub: Subscription;
  private _locationEditedSub: Subscription;
  private _locationDeletedSub: Subscription;

  public constructor(private apiService: ApiService, private _snackBar: MatSnackBar) {
  }

  public onMapRightClick(event: LeafletMouseEvent) {
    const x = event.latlng.lng;
    const y = event.latlng.lat;
    this._openLocationDialog({x, y, title: ''})
  }

  public onMarkerClick(event: any) {
    const x = event.latlng.lng;
    const y = event.latlng.lat;

    const location = this.locations.find(l => l.x === x && l.y === y);

    if (location) {
      this._openLocationDialog(location);
    }
  }

  public onLocationSave(location: ILocation) {
    this.onDialogClose();

    if (location.id) {
      this.apiService.editLocation(location);
    } else {
      this.apiService.createLocation(location);
    }
  }

  public onLocationDelete(location: ILocation) {
    this.onDialogClose();

    if (location.id) {
      this.apiService.deleteLocation(location);
    }
  }

  public onDialogClose() {
    this.dialogOpen = false;
    this.dialogLocation = null;
  }

  private _openLocationDialog(location: ILocation) {
    this.dialogLocation = {...location};
    this.dialogOpen = true;
  }

  private _onLocationsChanged(locations: ILocation[]) {
    this.locations = locations;
    this._getUserLocation();
    this._showMarkers();
  }

  private _getUserLocation() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((pos) => {
          const x = pos.coords.longitude;
          const y = pos.coords.latitude;

        this._currentLocation = {
          x, y
        };
      });
    }
  }

  private _onLocationCreated(location: ILocation) {
    this.locations.push(location);
    this._showMarkers();
  }

  private _onLocationEdited(location: ILocation) {
    const index = this.locations.findIndex(l => l.id === location.id);
    if (index > -1) {
      this.locations[index] = location;
      this._showMarkers();
    }
  }

  private _onLocationDeleted(locationId: number): void {
    const index = this.locations.findIndex(l => l.id === locationId);

    if (index > -1) {
      this.locations.splice(index, 1);
      this._showMarkers();
    }
  }

  private _initMap(): void {
    if (this._mapLoaded)
      return;

    this._mapLoaded = true;
    this._updateMapSize();
  }

  private _renderMap(): void {
    this._map = lMap(this._mapDiv, {
      zoom: 19,
      center: latLng(-25.86633167326632, 28.19057182157862),
      maxZoom: 19
    });

    this._baseLayer = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this._map.addLayer(this._baseLayer);
  }

  private _updateMapSize(): void {
    this.currentWidth = this._mapDiv.parentElement.clientWidth;
    this.currentHeight = this._mapDiv.parentElement.clientHeight;
  }

  private _showMarkers(): void {
    const icon: Icon = lIcon({
      iconUrl: MapIconOptions.mapIcon,
      iconSize: MapIconOptions.iconSize,
      iconAnchor: MapIconOptions.iconAnchor,
      shadowUrl: MapIconOptions.mapShadowIcon,
      shadowSize: MapIconOptions.shadowSize,
      shadowAnchor: MapIconOptions.shadowAnchor,
    });

    this._map.eachLayer(layer => {
      if (layer.getTooltip()) {
        layer.removeFrom(this._map);
      }
    })
    
    this.locations.forEach(location => {
      marker(latLng(location.y, location.x), { icon }).bindTooltip(location.title, { direction: 'top', offset: [12.5, -35] }).addTo(this._map).on('click', this.onMarkerClick.bind(this));
    });

    if (this._currentLocation) {
      marker(latLng(this._currentLocation.y, this._currentLocation.x), { icon }).bindTooltip('Current Location', { direction: 'top', offset: [12.5, -35] }).addTo(this._map);
    }

    marker(latLng(-25.86633167326632, 28.19057182157862), { icon }).bindTooltip('GLOVent', { direction: 'top', offset: [12.5, -35] }).addTo(this._map);
  }

  @HostListener('window:resize', ['$event'])
  private _onResize() {
    this._updateMapSize();
    this._map.invalidateSize();
  }

  ngOnInit(): void {
    this._locationsSub = this.apiService.locations.subscribe(this._onLocationsChanged.bind(this));
    this._errorSub = this.apiService.error.subscribe(({ error }) => {
      this._snackBar.open(error, undefined, { panelClass: 'warn', duration: 5000 });
    });
    this._locationCreatedSub = this.apiService.newLocation.subscribe(this._onLocationCreated.bind(this));
    this._locationEditedSub = this.apiService.editedLocation.subscribe(this._onLocationEdited.bind(this));
    this._locationDeletedSub = this.apiService.deletedLocation.subscribe(this._onLocationDeleted.bind(this));

    this._mapDiv = this._mapDivRef.nativeElement;
    this._initMap();
    this._renderMap();
    this._showMarkers();

    this._getUserLocation();
  }

  ngOnDestroy(): void {
    this._locationsSub.unsubscribe();
    this._errorSub.unsubscribe();
    this._locationCreatedSub.unsubscribe();
    this._locationDeletedSub.unsubscribe();
    this._locationEditedSub.unsubscribe();

    this._map.off();
  }

  ngAfterViewInit(): void {
      this._map.invalidateSize();
      this._map.on('contextmenu', this.onMapRightClick.bind(this))
  }
}
