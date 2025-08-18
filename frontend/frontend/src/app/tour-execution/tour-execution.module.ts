import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TouristLocationComponent } from './tourist-location/tourist-location';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
  
  ],
  imports: [
    CommonModule,
    SharedModule,
    TouristLocationComponent,
  ],
  exports: [
    TouristLocationComponent
  ]
})
export class TourExecutionModule { }