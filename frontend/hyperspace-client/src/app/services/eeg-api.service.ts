import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

// Define a type for our shape data for type safety
export interface ShapeData {
  sourceFile: string;
  vertices: number[];
}

@Injectable({
  providedIn: 'root'
})
export class EegApiService {
  // This is the address of our backend API in Docker.
  private readonly apiUrl = 'http://localhost:5000/api/eeg';

  constructor(private http: HttpClient) { }

  public uploadFile(file: File): Observable<ShapeData> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ShapeData>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    // Return a user-facing error message
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}