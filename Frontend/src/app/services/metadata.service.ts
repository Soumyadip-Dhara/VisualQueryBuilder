import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchemaInfo, TableInfo, ColumnInfo, ForeignKeyInfo } from '../models/database.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private apiUrl = `${environment.apiUrl}/api/metadata`;

  constructor(private http: HttpClient) { }

  getSchemas(): Observable<SchemaInfo[]> {
    return this.http.get<SchemaInfo[]>(`${this.apiUrl}/schemas`);
  }

  getTables(schemaName?: string): Observable<TableInfo[]> {
    let params = new HttpParams();
    if (schemaName) {
      params = params.set('schemaName', schemaName);
    }
    return this.http.get<TableInfo[]>(`${this.apiUrl}/tables`, { params });
  }

  getColumns(schemaName: string, tableName: string): Observable<ColumnInfo[]> {
    const params = new HttpParams()
      .set('schemaName', schemaName)
      .set('tableName', tableName);
    return this.http.get<ColumnInfo[]>(`${this.apiUrl}/columns`, { params });
  }

  getForeignKeys(schemaName?: string): Observable<ForeignKeyInfo[]> {
    let params = new HttpParams();
    if (schemaName) {
      params = params.set('schemaName', schemaName);
    }
    return this.http.get<ForeignKeyInfo[]>(`${this.apiUrl}/foreign-keys`, { params });
  }
}
