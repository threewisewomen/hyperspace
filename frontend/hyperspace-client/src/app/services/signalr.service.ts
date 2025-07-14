import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs'; // Import Subject for reactive event handling
import { ShapeData } from './eeg-api.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  public connectionId?: string;

  // We use a Subject to broadcast the received shape data to any component that subscribes.
  public shapeDataReceived = new Subject<ShapeData>();

  public startConnection = () => {
    const hubUrl = 'http://localhost:5000/neurohub';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.connectionId = this.hubConnection.connectionId ?? undefined;
        console.log(`SignalR Connection started with ID: ${this.connectionId}`);

        // Set up the listener for when file processing is complete.
        this.addShapeProcessingListener();
      })
      .catch(err => console.error('Error while starting SignalR connection: ', err));
  }

  // NEW METHOD: After uploading and getting a trackingId, we call this.
  public trackProcessing(trackingId: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('AssociateWithTrackingId', trackingId)
        .catch(err => console.error('Error while invoking AssociateWithTrackingId: ', err));
    }
  }

  // NEW LISTENER: This listens for the server-pushed result.
  private addShapeProcessingListener(): void {
    this.hubConnection.on('ShapeProcessingComplete', (data: ShapeData) => {
      console.log('Received processed shape data via SignalR!', data);
      // Push the data into our Subject, which broadcasts it to subscribers.
      this.shapeDataReceived.next(data);
    });
  }
}