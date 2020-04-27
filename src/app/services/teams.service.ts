import { Injectable, Inject } from '@angular/core';
import { Team} from '../shared/classes/team';
import { Observable} from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';





const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class TeamsService {

  private teamsUrl = `${this.apiEndpoint}/teams`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET teams List */
  getTeams(projectId: number): Observable<Team[]> {
    projectId = projectId || null;
    return  this.http.get<Team[]>(`${this.teamsUrl}`, {params: {project_id: projectId.toString()}});
  }

  /** GET teams List by type*/
  getTeamsByType(projectId: number, typeteam: string): Observable<Team[]> {
    projectId = projectId || null;
    return  this.http.get<Team[]>(`${this.teamsUrl}`, {params: {project_id: projectId.toString(), typeteam: typeteam}});
  }

  /** PUT: update the user on the server */
  updateTeams (teams: Team[]): Observable<any> {
    return this.http.put(`${this.teamsUrl}/bulk`, teams, httpOptions);
  }

  /** DELETE: delete team from db */
  deleteTeam (id: string): Observable<any> {
    return this.http.delete(`${this.teamsUrl}?id=${id}`, httpOptions);
  }

}
