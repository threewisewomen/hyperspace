import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { VisualizationCanvasComponent } from './components/visualization-canvas/visualization-canvas.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { SignalrService } from './services/signalr.service';
import { ShapeData } from './services/eeg-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    VisualizationCanvasComponent,
    FileUploaderComponent
  ],
  templateUrl: './app.component.html', // Pointing to a separate HTML file now
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public currentVertices: number[] = [];
  private shapeDataSubscription?: Subscription;

  // We only need the SignalR service now for this logic
  constructor(private signalrService: SignalrService) {}

  ngOnInit(): void {
    // Start the persistent SignalR connection when the app loads
    this.signalrService.startConnection();

    // Subscribe to the shape data Subject from the SignalR service
    this.shapeDataSubscription = this.signalrService.shapeDataReceived
      .subscribe((data: ShapeData) => {
        // When new data arrives, update the property bound to our canvas
        this.currentVertices = data.vertices;
      });
  }

  ngOnDestroy(): void {
    // Clean up the subscription when the component is destroyed
    this.shapeDataSubscription?.unsubscribe();
  }
}