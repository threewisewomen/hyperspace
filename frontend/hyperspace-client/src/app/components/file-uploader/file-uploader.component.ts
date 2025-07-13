import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import our API service and the ShapeData type
import { EegApiService, ShapeData } from '../../services/eeg-api.service';
import { finalize } from 'rxjs';

// Import Material modules
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  template: `
    <div
      class="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
      (click)="fileInput.click()"
    >
      <input #fileInput type="file" (change)="onFileSelected($event)" class="hidden" />
      
      <div *ngIf="!isLoading">
        <mat-icon class="scale-[2] text-gray-500">upload_file</mat-icon>
        <p class="mt-2 text-gray-600">Click or Drag EEG File Here</p>
      </div>

      <div *ngIf="isLoading">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p class="mt-2 text-gray-600">Processing {{ fileName }}...</p>
      </div>
      
      <div *ngIf="errorMessage" class="text-red-500 mt-2">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: ``
})
export class FileUploaderComponent {
  // This component will emit an event with the shape data when successful
  @Output() shapeReceived = new EventEmitter<ShapeData>();

  isLoading = false;
  fileName = '';
  errorMessage = '';

  constructor(private eegApiService: EegApiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;
      this.isLoading = true;
      this.errorMessage = '';

      this.eegApiService.uploadFile(file)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (shapeData) => {
            console.log('Received shape data!', shapeData);
            this.shapeReceived.emit(shapeData);
          },
          error: (err) => {
            this.errorMessage = err.message;
          }
        });
    }
  }
}