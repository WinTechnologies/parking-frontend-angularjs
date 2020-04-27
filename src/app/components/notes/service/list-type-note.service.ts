import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListTypeNote } from '../models/list-type-note.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgListTypeNoteService {
  private apiUrl = `${this.apiEndpoint}/pg/list-type-note`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET List type note from the server */
  public get(options?: any): Observable<ListTypeNote[]> {
    return this.http.get<ListTypeNote[]>(this.apiUrl,  {params: options});
  }

  /** GET all the list type note with operation_type different from the Enforcement */
  public getWithNoEnforcementType(options?: any): Observable<ListTypeNote[]> {
    const url = `${this.apiUrl}/no-enforcement-type`;
    return this.http.get<ListTypeNote[]>(url, {params: options});
  }

  /** POST: create a new List type note on the server */
  public create (listTypeNote: ListTypeNote): Observable<ListTypeNote> {
    return this.http.post<ListTypeNote>(this.apiUrl, listTypeNote, httpOptions);
  }

  /** PUT: update the List type note on the server */
  public update (listTypeNote: ListTypeNote): Observable<any> {
    const id = listTypeNote.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ListTypeNote>(url, listTypeNote, httpOptions);
  }

  /** DELETE: delete the List type note on the server */
  public delete (listTypeNote: ListTypeNote): Observable<any> {
    const id = listTypeNote.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ListTypeNote>(url, httpOptions);
  }
}