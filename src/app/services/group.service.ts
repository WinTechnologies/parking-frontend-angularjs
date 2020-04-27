import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Group } from '../components/tariff-enforcement/enforcement-groups/group';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class GroupService {

  private groupUrl = `${this.apiEndpoint}/pg/groups`;
  private groupViolationUrl = `${this.groupUrl}/violation`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  getGroups(project_id) {
    return this.http.get<Group[]>(this.groupUrl, { params: { project_id } });
  }

  getGroupById(id) {
    return this.http.get<Group[]>(this.groupUrl, { params: { id } });
  }

  addGroup(group) {
    return this.http.post<Group>(this.groupUrl, group, httpOptions);
  }

  updateGroup(group, groupId) {
    const url = `${this.groupUrl}/${groupId}`;
    return this.http.put<Group>(url, group, httpOptions);
  }

  deleteGroup(groupId) {
    const url = `${this.groupUrl}/${groupId}`;
    return this.http.delete<Group>(url, httpOptions);
  }

  getParkingZones(project_id) {
    return this.http.get<any[]>(this.groupUrl + `/zones`, { params: { project_id } });
  }

  getAssignments(project_id, group_id) {
    const url = this.groupViolationUrl + `/details`;
    return this.http.get<any[]>(url, { params: { project_id, group_id } });
  }

  getAssignmentById(id) {
    const url = `${this.groupViolationUrl}/${id}`;
    return this.http.get<any>(url);
  }

  updateAssignmentById(assignment, groupViolation_id) {
    const url = `${this.groupViolationUrl}/${groupViolation_id}`;
    return this.http.put<any[]>(url, assignment, httpOptions);
  }

  createAssigment(assignment) {
    return this.http.post<any>(this.groupViolationUrl, assignment, httpOptions);
  }

  deleteAssignmentById(id) {
    const url = `${this.groupViolationUrl}/${id}`;
    return this.http.delete<any>(url, httpOptions);
  }

}
