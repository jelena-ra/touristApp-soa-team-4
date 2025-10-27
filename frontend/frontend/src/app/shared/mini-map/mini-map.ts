import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mini-map',
  standalone: true,
  imports: [],
  template: `<div class="mini-map-container" [id]="mapId"></div>`,
  styles: [`.mini-map-container { height: 100%; width: 100%; }`]
})
export class MiniMapComponent implements AfterViewInit {
  private map: any;
  private marker: L.Marker | null = null;
  
  @Input() initialCenter: { lat: number, lon: number } = { lat: 45.25, lon: 19.83 };
  @Input() mapId: string = `map-${Math.random().toString(36).substring(2)}`;
  
  @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapId, {
      center: [this.initialCenter.lat, this.initialCenter.lon],
      zoom: 15
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 10,
      attribution: '&copy; OpenStreetMap'
    });
    tiles.addTo(this.map);
    
    this.updateMarker(this.initialCenter.lat, this.initialCenter.lon);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updateMarker(e.latlng.lat, e.latlng.lng);
      this.locationSelected.emit({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });
  }
  
  private updateMarker(lat: number, lon: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      this.marker = L.marker([lat, lon]).addTo(this.map);
    }
  }
}