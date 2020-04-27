// TODO: check if this service is no longer used
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Project } from '../shared/classes/project';
import { Observable,  of } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class ProjectService {

  private projectUrl = `${this.apiEndpoint}/projects`;
  public activeProject: number;
  public activeProjectObject: Project;
  public projectsList: Project[];

  /** GET zones from the server */
  getProjects(): Observable<Project[]> {
    return  this.http.get<Project[]>(this.projectUrl);
  }

  getProjectById(projectId: number): Observable<Project[]> {
    return  this.http.get<Project[]>(this.projectUrl, {params: {id: projectId.toString()}});
  }
  /** GET zones from the server */
  getAvailableSites(id: string): Observable<any[]> {
    let url = `${this.projectUrl}/availableSites`;
    if (id) {
      url += `?id=${id}`;
    }
    return  this.http.get<any[]>(url).pipe(
      map(response => response.map(x => {
        return {
          id: x.id,
          name: x.name
        };
      } )));
  }
  /** PUT: update the Project on the server */
  updateProject (project: Project): Observable<any> {
    //noinspection TypeScriptUnresolvedFunction
    return this.http.put(this.projectUrl, project, httpOptions);
  }

  /** POST: add a new Project to the server */
  addProject (project: Project): Observable<Project> {
    //noinspection TypeScriptUnresolvedFunction
    return this.http.post<Project>(this.projectUrl, project, httpOptions);
  }

  /** DELETE: delete the Project from the server */
  deleteProject (project: Project | string): Observable<Project> {
    const id = typeof project === 'string' ? project : project.id;
    const url = `${this.projectUrl}?id=${id}`;

    return this.http.delete<Project>(url, httpOptions);
  }

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
    this.activeProjectObject = new Project();
    if (!this.activeProject && localStorage.getItem('activeProject')) {
      try {
        this.activeProject = +localStorage.getItem('activeProject');
      } catch (e) {
        console.log(e);
      }
    }
  }
}
