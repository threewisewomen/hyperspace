import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

// This interface is now for the UPLOAD RESPONSE, not the final data.
export interface UploadResponse {
  trackingId: string;
}

// Keep the ShapeData type for when we receive it via SignalR.
export interface ShapeData {
  sourceFile: string;
  vertices: number[];
}

@Injectable({
  providedIn: 'root'
})
export class EegApiService {
  private readonly apiUrl = 'http://localhost:5000/api/eeg';

  constructor(private http: HttpClient) { }

  public uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something bad happened during file upload.'));
  }
}