import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  public connectionId?: string;

  public startConnection = () => {
    // This URL must match the one your backend API is exposed on by Docker Compose.
    // We will create the '/neurohub' endpoint on the backend later.
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
        // Here we will eventually add our data listeners
        this.addReceiveSceneUpdateListener();
      })
      .catch(err => console.error('Error while starting SignalR connection: ', err));
  }

  // This method will listen for data from the backend.
  // For now, it will just log the data to the console.
  public addReceiveSceneUpdateListener = () => {
    this.hubConnection.on('ReceiveSceneUpdate', (data) => {
      console.log('Received scene update from backend:', data);
    });
  }
}