import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // Dodaj ako koristiš <mat-select>
import { MatOptionModule } from '@angular/material/core'; // Dodaj ako koristiš <mat-option>
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule, // Dodaj ako koristiš <mat-select>
    MatOptionModule, // Dodaj ako koristiš <mat-option>
    MatCardModule,
  ],
  exports: [
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule, // Dodaj ako koristiš <mat-select>
    MatOptionModule, // Dodaj ako koristiš <mat-option>
    MatCardModule,
  ]
})
export class MaterialModule { }
