import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EegApiService } from '../../services/eeg-api.service';
import { SignalrService } from '../../services/signalr.service'; // Import SignalR service
import { finalize, Subscription } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  // We keep the template in its own file
  templateUrl: './file-uploader.component.html', 
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnDestroy {
  // We no longer need an @Output for shape data.
  
  isLoading = false;
  statusMessage = 'Click or Drag EEG File Here';
  errorMessage = '';
  private uploadSubscription?: Subscription;

  // We now need both services.
  constructor(
    private eegApiService: EegApiService,
    private signalrService: SignalrService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.statusMessage = `Uploading ${file.name}...`;
      this.isLoading = true;
      this.errorMessage = '';

      // Cancel any previous upload subscription
      this.uploadSubscription?.unsubscribe();
      
      this.uploadSubscription = this.eegApiService.uploadFile(file)
        .pipe(
          // Note: `finalize` doesn't help here because the real "loading" continues.
          // We will manage the loading state manually.
        )
        .subscribe({
          next: (response) => {
            console.log('File accepted by server. Tracking ID:', response.trackingId);
            this.statusMessage = `Processing ${file.name}... (This may take a moment)`;
            // Crucial step: tell SignalR to listen for this specific task
            this.signalrService.trackProcessing(response.trackingId);
          },
          error: (err) => {
            this.errorMessage = err.message;
            this.isLoading = false;
            this.statusMessage = 'Upload failed. Please try again.';
          }
        });
    }
  }

  // Listen to the SignalR service to know when processing is done
  ngOnInit() {
    this.signalrService.shapeDataReceived.subscribe(shapeData => {
        this.isLoading = false;
        this.statusMessage = `Processing for ${shapeData.sourceFile} complete!`;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks.
    this.uploadSubscription?.unsubscribe();
  }
}