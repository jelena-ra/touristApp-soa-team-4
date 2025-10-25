import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interface za odgovor sa servera nakon uploada
export interface ImageUploadResponse {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  // Kasnije će ova metoda slati pravi HTTP POST zahtev
  uploadImage(file: File): Observable<ImageUploadResponse> {
    console.log(`Pravim se da uploadujem fajl: ${file.name}`);

    // LAŽIRAMO ODGOVOR SA SERVERA
    // Vraćamo lažni URL nakon "uploada" koji traje 1 sekundu
    const fakeResponse: ImageUploadResponse = {
      url: `https://fake-server.com/images/${file.name}`
    };

    return of(fakeResponse).pipe(delay(1000));
  }
}