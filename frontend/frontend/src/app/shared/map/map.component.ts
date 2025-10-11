import { Component, AfterViewInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import * as L from 'leaflet';
import { Output, EventEmitter } from '@angular/core';
import { MapService } from './map';
import { KeyPointInterface } from '../../tours/model/key-point.interface';
import 'leaflet-routing-machine';

// Komponenta za prikaz interaktivne mape.
// Koristi Leaflet biblioteku.
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnChanges  {
  // Privatna varijabla za instancu Leaflet mape.
  private map: any;
  // Privatna varijabla za praćenje trenutnog markera.
  private currentMarker: L.Marker | null = null;
  private keyPointMarkers: L.Marker[] = [];
  private routeControl: L.Routing.Control | null = null;
  
  @Input() registerClick: boolean = true;

  @Input() keyPoints: KeyPointInterface[] = [];
  @Input() showKeyPoints: boolean = false;
  

  // Definisanje izlaznog (Output) događaja koji će emitovati
  // objekat sa koordinatama.
  @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();

  constructor(
    private service: MapService
  ) { }

 

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

    this.drawKeyPoints();
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
      if(this.registerClick) {
        console.log(
          'Kliknuli ste na mapu na poziciji: ' + lat + ' i dužina: ' + lng
        );
      }
      
      // Kreiranje novog markera i postavljanje ga na mapu
      this.currentMarker = L.marker([lat, lng]).addTo(this.map);

      // Emitovanje događaja sa podacima o lokaciji
      this.locationSelected.emit({ latitude: lat, longitude: lng });
    });
  }

  private drawKeyPoints(): void {
    if(!this.showKeyPoints || !this.keyPoints) return;

    this.keyPointMarkers.forEach(marker => this.map.removeLayer(marker));
    this.keyPointMarkers = [];

    this.keyPoints.forEach((kp: KeyPointInterface) => {
      const marker = L.marker([kp.latitude, kp.longitude]).addTo(this.map);

      const popupContent = `<b>${kp.name}</b><br>${kp.description}`;
      marker.bindPopup(popupContent);

      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());

      this.keyPointMarkers.push(marker);
    });
  }

  removeCurrentMarker(): void {
    if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
        this.currentMarker = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['keyPoints'] && this.map) {
      this.drawKeyPoints();
     
      this.drawRoute(); 
    
      this.removeCurrentMarker();
    }
  }
  private drawRoute(): void {
  // 1. Proveravamo da li imamo bar dve tačke za iscrtavanje
  if (!this.map || !this.keyPoints || this.keyPoints.length < 2) {
    return;
  }

  // 2. Ako već postoji stara ruta, uklanjamo je sa mape
  if (this.routeControl) {
    this.map.removeControl(this.routeControl);
  }

  // 3. Kreiramo 'waypoints' (putne tačke) iz vašeg niza ključnih tačaka
  const waypoints = this.keyPoints.map(kp => L.latLng(kp.latitude, kp.longitude));

  // 4. Kreiramo kontrolu za rutiranje, kao u uputstvu
  this.routeControl = L.Routing.control({
    waypoints: waypoints,
    router: L.routing.mapbox('pk.eyJ1IjoiZGp1cmRqZXZpY20iLCJhIjoiY20yaHVzOTgyMGJwbzJqczNteW1xMm0yayJ9.woKtBh92sOV__L25KcUu_Q', { profile: 'mapbox/walking' }),
    // Opcije za prilagođavanje izgleda
    routeWhileDragging: false,
    addWaypoints: false, // Onemogućava dodavanje novih tačaka klikom
    show: false, // Sakriva panel sa instrukcijama "levo-desno"
    //draggableWaypoints: false,
 
    fitSelectedRoutes: true
  }).addTo(this.map);

  // Možete dodati i event listener kao u primeru, ako želite da prikažete info
  this.routeControl.on('routesfound', function(e) {
    const routes = e.routes;
    const summary = routes[0].summary;
    // Prikazemo info u konzoli umesto alert-a
    console.log('Total distance is ' + summary.totalDistance / 1000 + ' km and total time is ' + Math.round(summary.totalTime / 60) + ' minutes');
  });
}

}
