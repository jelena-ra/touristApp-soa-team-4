import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Output, EventEmitter } from '@angular/core';
import { MapService } from './map';

// Komponenta za prikaz interaktivne mape.
// Koristi Leaflet biblioteku.
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  // Privatna varijabla za instancu Leaflet mape.
  private map: any;
  // Privatna varijabla za praćenje trenutnog markera.
  private currentMarker: L.Marker | null = null;
  
  // Definisanje izlaznog (Output) događaja koji će emitovati
  // objekat sa koordinatama.
  @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();

  constructor(private service: MapService) { }

  // Metoda za inicijalizaciju mape.
  // Postavlja centar, nivo zumiranja i OpenStreetMap slojeve.
  private initMap(): void {
    // Kreiranje instance mape u HTML elementu sa id-jem 'map'.
    this.map = L.map('map', {
      center: [45.2396, 19.8227], // Centar mape (Novi Sad, Srbija)
      zoom: 13, // Početni nivo zumiranja
    });

    // Kreiranje sloja pločica sa OpenStreetMap-a.
    // Ovo obezbeđuje vizuelni prikaz mape.
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' // Atribucija za OpenStreetMap
      }
    );

    // Dodavanje sloja na mapu.
    tiles.addTo(this.map);

    // Poziv funkcije za registraciju klikova.
    this.registerOnClick();
  }

  // Angular lifecycle hook, poziva se nakon što se view komponente inicijalizuje.
  // Idealno mesto za inicijalizaciju biblioteka kao što je Leaflet.
  ngAfterViewInit(): void {
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
    });

    L.Marker.prototype.options.icon = DefaultIcon;
    this.initMap();
  }

  // Metoda koja registruje 'click' događaj na mapi.
  // Na klik, uklanja stari i postavlja novi marker.
  registerOnClick(): void {
    this.map.on('click', (e: any) => {
      // Ako već postoji marker na mapi, ukloni ga.
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      const coord = e.latlng;
      const lat = coord.lat;
      const lng = coord.lng;
      console.log(
        'Kliknuli ste na mapu na poziciji: ' + lat + ' i dužina: ' + lng
      );
      
      // Kreiranje novog markera i postavljanje ga na mapu
      this.currentMarker = L.marker([lat, lng]).addTo(this.map);

      // Emitovanje događaja sa podacima o lokaciji
      this.locationSelected.emit({ latitude: lat, longitude: lng });
    });
  }
}
