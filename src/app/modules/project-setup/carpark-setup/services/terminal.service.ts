import { Injectable, Inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { Airport, Terminal } from '../models/carpark-items.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable()
export class TerminalService {

  private apiUrl = `/pg/project-terminal`;

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  public get() {
    const url = `${this.apiUrl}`;
    return this.apiService.get(url);
  }

  public getAllByProject(projectId: number): Promise<Terminal[]> {
    const url = `${this.apiUrl}/by-project/${projectId}`;
    return this.apiService.get(url);
  }

  public getByProjectZone(zoneId: number): Promise<Terminal[]> {
    const url = `${this.apiUrl}/by-zone/${zoneId}`;
    return this.apiService.get(url);
  }

  public getTerminalCode(): Promise<string> {
    const url = `${this.apiUrl}/terminal-code`;
    return this.apiService.get(url);
  }

  public getAirports(filter: string): Observable<Airport[]> {
    return  this.http.get<Airport[]>(`${this.apiEndpoint}${this.apiUrl}/airport?name=${filter}`);
  }

  create(terminal): Promise<any> {
    const url = `${this.apiUrl}`;
    return this.apiService.post(url, terminal);
  }

  update(terminal): Promise<any> {
    const url = `${this.apiUrl}/${terminal.id}`;
    return this.apiService.put(url, terminal);
  }

  delete(terminalId: number): Promise<any> {
    const url = `${this.apiUrl}/${terminalId}`;
    return this.apiService.delete(url);
  }
}
