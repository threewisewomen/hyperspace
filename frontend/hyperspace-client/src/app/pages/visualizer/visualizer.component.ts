import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Import all the components and modules this page needs
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { VisualizationCanvasComponent } from '../../components/visualization-canvas/visualization-canvas.component';
import { FileUploaderComponent } from '../../components/file-uploader/file-uploader.component';
import { SignalrService } from '../../services/signalr.service';
import { ShapeData } from '../../services/eeg-api.service';
import { RouterLink } from '@angular/router'; // For linking back home


@Component({
  selector: 'app-visualizer',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatToolbarModule, MatCardModule,
    VisualizationCanvasComponent, FileUploaderComponent
  ],
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit, OnDestroy {
  // This logic is identical to what was in your old AppComponent
  public currentVertices: number[] = [];
  private shapeDataSubscription?: Subscription;

  constructor(private signalrService: SignalrService) {}

  ngOnInit(): void {
    // We start the connection when this page loads
    // Note: If you want the connection to be persistent across the whole site,
    // this would stay in AppComponent. For now, this is fine.
    this.signalrService.startConnection();

    this.shapeDataSubscription = this.signalrService.shapeDataReceived
      .subscribe((data: ShapeData) => {
        this.currentVertices = data.vertices;
      });
  }

  ngOnDestroy(): void {
    this.shapeDataSubscription?.unsubscribe();
    // Here you could also call a signalrService.stopConnection() if desired.
  }
}