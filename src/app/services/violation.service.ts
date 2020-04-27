import { Injectable, Inject } from '@angular/core';
import { Violation } from '../shared/classes/violation';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ViolationService {

  private violationsPgUrl = `${this.apiEndpoint}/pg/violation`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  getViolationsByProjectId(project_id) {
    return this.http.get<Violation[]>(this.violationsPgUrl, { params: { project_id: project_id } });
  }

  getViolationById(id) {
    return this.http.get<Violation[]>(this.violationsPgUrl, { params: { id: id } });
  }

  addViolation(violation) {
    return this.http.post<Violation>(this.violationsPgUrl, violation, httpOptions);
  }

  updateViolation(violation, id) {
    const url = `${this.violationsPgUrl}/${id}`;
    return this.http.put<Violation>(url, violation, httpOptions);
  }

  deleteViolation(id) {
    const url = `${this.violationsPgUrl}/${id}`;
    return this.http.delete<Violation>(url, httpOptions);
  }
}
