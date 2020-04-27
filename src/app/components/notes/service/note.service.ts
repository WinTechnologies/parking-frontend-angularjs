import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Note } from '../models/note.model';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgNoteService {
  private apiUrl = `${this.apiEndpoint}/pg/notes`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** Create Note **/
  addNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note, httpOptions);
  }

  /** Get Notes **/
  getEmployeeNotes(id: string): Observable<Note[]> {
    const url = `${this.apiUrl}/employee/${id}`;
    return this.http.get<Note[]>(url, httpOptions);
  }

  /** Update Notes **/
  updateNote(note: Note): Observable<any> {
    const id = note.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<any>(url, note, httpOptions);
  }

  /** Delete Note **/
  deleteNote(id: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url, httpOptions);
  }
}