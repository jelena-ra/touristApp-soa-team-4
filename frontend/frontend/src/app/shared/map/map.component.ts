import { Component, AfterViewInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from './map'; 
import { KeyPointInterface } from '../../tours/model/key-point.interface';

@Component({
  selector: 'app-map',
  standalone: true, 
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private map: any;
  private currentMarker: L.Marker | null = null;
  private keyPointMarkers: L.Marker[] = [];
  private routeControl: L.Routing.Control | null = null;
  
  @Input() registerClick: boolean = true;
  @Input() keyPoints: KeyPointInterface[] = [];
  @Input() showKeyPoints: boolean = false;

  @Input() initialCenter?: { lat: number, lon: number };
  @Input() initialMarker?: { lat: number, lon: number };
  
  @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();
  @Output() markerClicked = new EventEmitter<KeyPointInterface>();

  constructor(private service: MapService) { }

  ngAfterViewInit(): void {
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-shadow.png'
    });
    L.Marker.prototype.options.icon = DefaultIcon;
    
    // Add a small delay to ensure the DOM is ready, especially in dialogs
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['keyPoints'] && this.map) {
      this.updateMapDisplay();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    // Check if the map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Check if map is already initialized
    if (this.map) {
      console.log('Map already initialized, skipping...');
      return;
    }

    const centerCoords: [number, number] = this.initialCenter && this.initialCenter.lat !== 0
      ? [this.initialCenter.lat, this.initialCenter.lon]
      : [45.2396, 19.8227];

    this.map = L.map('map', {
      center: centerCoords,
      zoom: 13,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.addTo(this.map);

    if (this.initialMarker && this.initialMarker.lat !== 0) {
      this.currentMarker = L.marker([this.initialMarker.lat, this.initialMarker.lon]).addTo(this.map);
    }

    this.registerOnClick();
    this.updateMapDisplay(); 
  }

  private updateMapDisplay(): void {
    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
      this.routeControl = null;
    }


    this.keyPointMarkers.forEach(marker => this.map.removeLayer(marker));
    this.keyPointMarkers = [];

    if (this.showKeyPoints && this.keyPoints) {
      this.keyPoints.forEach((kp: KeyPointInterface) => {
        const marker = L.marker([kp.latitude, kp.longitude]).addTo(this.map);
        const popupContent = `<b>${kp.name}</b><br>${kp.description}`;
        marker.bindPopup(popupContent);
        marker.on('mouseover', () => marker.openPopup());
        marker.on('mouseout', () => marker.closePopup());
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          this.markerClicked.emit(kp);
        });
        this.keyPointMarkers.push(marker);
      });
    }


    if (this.keyPoints && this.keyPoints.length >= 2) {
      const waypoints = this.keyPoints.map(kp => L.latLng(kp.latitude, kp.longitude));

      this.routeControl = L.Routing.control({
        waypoints: waypoints,
        router: L.routing.mapbox('pk.eyJ1IjoiZGp1cmRqZXZpY20iLCJhIjoiY20yaHVzOTgyMGJwbzJqczNteW1xMm0yayJ9.woKtBh92sOV__L25KcUu_Q', { profile: 'mapbox/walking' }),
      
      plan: L.Routing.plan(waypoints, {

        createMarker: () => false, 
        draggableWaypoints: false,
        addWaypoints: false,
      }),

        show: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
      }).addTo(this.map);

      this.routeControl.on('routesfound', function(e) {
        const summary = e.routes[0].summary;
        console.log(`Route found: ${summary.totalDistance / 1000} km, ${Math.round(summary.totalTime / 60)} min`);
      });
    }

    this.removeCurrentMarker();
  }

  private registerOnClick(): void {
    this.map.on('click', (e: any) => {
      if (!this.registerClick) return;

      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }
      const coord = e.latlng;
      this.currentMarker = L.marker([coord.lat, coord.lng]).addTo(this.map);
      this.locationSelected.emit({ latitude: coord.lat, longitude: coord.lng });
    });
  }

  removeCurrentMarker(): void {
    if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
        this.currentMarker = null;
    }
  }

  // Method to check if map is initialized
  isMapInitialized(): boolean {
    return this.map !== null && this.map !== undefined;
  }

  // Method to reinitialize map if needed (useful for dialogs)
  reinitializeMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    // Clear any existing map data from the container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = '';
    }
    
    setTimeout(() => {
      this.initMap();
    }, 50);
  }
}