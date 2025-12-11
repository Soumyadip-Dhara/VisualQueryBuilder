import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QueryRequest, QueryResult } from '../models/database.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private apiUrl = `${environment.apiUrl}/api/query`;

  constructor(private http: HttpClient) { }

  executeQuery(request: QueryRequest): Observable<QueryResult> {
    return this.http.post<QueryResult>(`${this.apiUrl}/execute`, request);
  }
}
