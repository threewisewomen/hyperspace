import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { ShapeData } from './eeg-api.service';

// --- NEW INTERFACE ---
// Defines the structure of the real-time data packet from the backend.
export interface SceneUpdate {
  timestamp: string;
  rotation: {
    y: number;
  };
  // We can add more properties here later, like `vertices` and `colors`.
}
// --------------------

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  public shapeDataReceived = new Subject<ShapeData>();
  // NEW SUBJECT: For real-time scene updates.
  public sceneUpdateReceived = new Subject<SceneUpdate>();

  public startConnection = () => {
    // ... (the connection logic remains the same)
    const hubUrl = 'http://localhost:5000/neurohub';
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl).withAutomaticReconnect().build();

    this.hubConnection.start().then(() => {
        console.log(`SignalR Connection started.`);
        // Set up all our listeners here.
        this.addShapeProcessingListener();
        this.addRealtimeSceneUpdateListener(); // Add the new listener
      })
      .catch(err => console.error('Error while starting SignalR connection: ', err));
  }

  // This method for the file upload result is still correct
  private addShapeProcessingListener(): void {
    this.hubConnection.on('ShapeProcessingComplete', (data: ShapeData) => {
      console.log('Received processed shape data via SignalR!', data);
      this.shapeDataReceived.next(data);
    });
  }

  // --- NEW LISTENER ---
  private addRealtimeSceneUpdateListener(): void {
    // The name "ReceiveSceneUpdate" MUST match the string used in the C# backend.
    this.hubConnection.on('ReceiveSceneUpdate', (data: SceneUpdate) => {
      // Don't log this every frame as it will spam the console.
      // We just push it into the Subject.
      this.sceneUpdateReceived.next(data);
    });
  }
  
  // This method for tracking is still correct
  public trackProcessing(trackingId: string): void {
      if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
          this.hubConnection.invoke('AssociateWithTrackingId', trackingId)
              .catch(err => console.error('Error invoking AssociateWithTrackingId:', err));
      }
  }
}