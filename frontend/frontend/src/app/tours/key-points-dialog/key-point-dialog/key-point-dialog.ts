import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { KeyPointInterface } from '../../model/key-point.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { MiniMapComponent } from '../../../shared/mini-map/mini-map';

export interface KeyPointDialogData {
  isNew: boolean;
  keyPoint: KeyPointInterface;
}

@Component({
  selector: 'app-key-point-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MaterialModule, MiniMapComponent],
 templateUrl: './key-point-dialog.html',
 styleUrls: ['./key-point-dialog.scss']
})
export class KeyPointDialog {
  dialogRef = inject(MatDialogRef<KeyPointDialog>);
  data: KeyPointDialogData = inject(MAT_DIALOG_DATA);
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;

  constructor() {
   
    if (this.data.keyPoint.imageUrl) {
      this.filePreview = this.data.keyPoint.imageUrl;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'delete', data: this.data.keyPoint });
  }

  onSave(): void {
    this.dialogRef.close({ action: 'save', data: this.data.keyPoint, file: this.selectedFile  });
  }

  onLocationSelected(event: { latitude: number, longitude: number }): void {
    this.data.keyPoint.latitude = event.latitude;
    this.data.keyPoint.longitude = event.longitude;
  }

   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
}