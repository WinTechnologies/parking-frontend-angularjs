
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Observable ,  of } from 'rxjs';
import { EscalationRule } from '../shared/classes/escalation-rule';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class EscalationRuleService {
  private escalationRuleUrl = `${this.apiEndpoint}/escalation`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET Violations from the server */
  getRules(projectId: number): Observable<EscalationRule[]> {
    return  this.http.get<EscalationRule[]>(this.escalationRuleUrl, {params: {project_id: projectId.toString()}}).pipe(
      map(response => {
        return response.map(x =>
        new EscalationRule(x.id, x.site_id, x.project_id, x.site_name, x.number_cn, x.number_days, x.increment_amount, x.job_type, x.zones) );
      }));
  }

  /** PUT: update the Violation on the server */
  updateRule (rule: EscalationRule): Observable<any> {
    return this.http.put<EscalationRule>(this.escalationRuleUrl, rule, httpOptions);
  }

  /** POST: add a new Violation to the server */
  addRule (rule: EscalationRule): Observable<EscalationRule> {
    return this.http.post<EscalationRule>(this.escalationRuleUrl, rule, httpOptions);
  }

  /** DELETE: delete the Violation from the server */
  deleteRule (rule: EscalationRule | string): Observable<EscalationRule> {
    const id = typeof rule === 'string' ? rule : rule.id;
    const url = `${this.escalationRuleUrl}?id=${id}`;

    return this.http.delete<EscalationRule>(url, httpOptions);
  }

  /** DELETE: delete the Violation from the server */
  deleteByProject (project_id: number): Observable<any> {
    const url = `${this.escalationRuleUrl}/project?project_id=${project_id}`;
    return this.http.delete<EscalationRule>(url, httpOptions);
  }

  /** DELETE: delete the Violation from the server */
  deleteBySite (site_id: string): Observable<any> {
    const url = `${this.escalationRuleUrl}/site?site_id=${site_id}`;
    return this.http.delete<EscalationRule>(url, httpOptions);
  }
}
