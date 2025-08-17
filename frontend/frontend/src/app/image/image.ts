import { Component, EventEmitter, Input, Output, forwardRef, SimpleChanges, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImageService } from './image.service';
import { ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-image-upload',
  templateUrl: './image.html',
  styleUrls: ['./image.css'],
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageComponent),
      multi: true
    }
  ]
})
export class ImageComponent implements OnChanges, ControlValueAccessor {
  @Output() fileSelected = new EventEmitter<File>();
  @Output() addedFiles = new EventEmitter<File[]>();
  @Input() selectSingle = true;
  @Input() imagesToShow = '';


  focusFileInput() {
  this.imageUploadInput.nativeElement.focus();
}
  imageSrcs: string[] = [];
  showingImage: string | ArrayBuffer | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  index = 0;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  value: string = ''; // ovdje čuvaš imageURL (ili base64 ili ID iz backenda)

  constructor(private imageService: ImageService) {
    imageService.setControllerPath('tourist/image');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imagesToShow']) {
      this.showImages();
    }
  }

  ngOnInit(): void {
    this.showImages();
  }

  // ControlValueAccessor metode
  writeValue(value: string): void {
    this.value = value || '';
    if (value) {
      this.loadImage(Number(value));
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Ako želiš disable logiku, dodaj ovdje
  }

  // Funkcionalnost
  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      if (this.selectSingle) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
          this.imageSrc = reader.result;
          this.value = file.name; // ili URL sa servera
          this.onChange(this.value);
          this.fileSelected.emit(file);
        };
        reader.readAsDataURL(file);
      } else {
        const allFiles: File[] = [];
        this.imageSrcs = [];
        Array.from(input.files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) {
              this.imageSrcs.push(reader.result as string);
              this.showingImage = this.imageSrcs[0];
            }
          };
          reader.readAsDataURL(file);
          allFiles.push(file);
        });
        this.addedFiles.emit(allFiles);
      }
    }
  }

  loadImage(imageId: number) {
    this.imageService.getImage(imageId).subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      this.imageSrcs.push(url);
      this.showingImage = this.imageSrcs[0];
    });
  }
@ViewChild('imageUploadInput') imageUploadInput!: ElementRef;
  showImages() {
    if (this.imagesToShow) {
      this.imageSrcs = [];
      for (const imageId of this.imagesToShow.split(',')) {
        this.loadImage(Number(imageId));
      }
    }
  }
}
