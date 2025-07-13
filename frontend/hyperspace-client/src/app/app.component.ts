import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

// Import our standalone components and services
import { VisualizationCanvasComponent } from './components/visualization-canvas/visualization-canvas.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { SignalrService } from './services/signalr.service';
import { ShapeData } from './services/eeg-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatCardModule,
    VisualizationCanvasComponent,
    FileUploaderComponent, // Add the new uploader component
  ],
  template: `
    <div class="h-screen flex flex-col bg-gray-100">
      <mat-toolbar color="primary" class="flex-shrink-0 shadow-md">
        <span>Project Hyperspace - EEG Visualization Engine</span>
      </mat-toolbar>

      <div class="flex-grow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Control Panel Column -->
        <div class="md:col-span-1">
          <mat-card>
            <mat-card-content class="p-4">
              <h2 class="text-xl font-semibold mb-4">Controls</h2>
              <app-file-uploader (shapeReceived)="onShapeReceived($event)"></app-file-uploader>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Visualization Column -->
        <div class="md:col-span-2">
          <mat-card class="h-full">
            <mat-card-content class="h-full">
              <!-- Bind the received vertices to the canvas component's input -->
              <app-visualization-canvas [vertices]="currentVertices"></app-visualization-canvas>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Property to hold the vertex data
  public currentVertices: number[] = [];

  constructor(private signalrService: SignalrService) {}

  ngOnInit(): void {
    // We can keep the real-time connection for later
    // this.signalrService.startConnection();
  }

  // This method is called when the file uploader emits its event
  onShapeReceived(data: ShapeData): void {
    this.currentVertices = data.vertices;
  }
}