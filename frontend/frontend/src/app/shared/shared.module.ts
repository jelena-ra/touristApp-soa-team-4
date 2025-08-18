import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Uvozimo MapComponent. Ona je standalone, pa je ne deklarišemo.
import { MapComponent } from './map/map.component'; 

@NgModule({
  // Standalone komponente se ne deklarišu, one se Uvoze!
  declarations: [], 
  imports: [
    CommonModule,
   
    MapComponent 
  ],
  // I dalje je izvozimo kako bi bila dostupna van ovog modula
  exports: [
    MapComponent
  ]
})
export class SharedModule { }