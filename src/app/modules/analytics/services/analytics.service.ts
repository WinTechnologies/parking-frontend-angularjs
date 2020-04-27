import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable()
export class AnalyticsService {
  private apiUrl = `/pg/analytics`;
  private employeeUrl = `/pg/employees`;

  constructor(
    private apiService: ApiService,
  ) { }

  createDashboard(dashboard) {
    const url = `${this.apiUrl}/report`;
    return this.apiService.post(url, dashboard);
  }

  createChart(chart) {
    const url = `${this.apiUrl}/chart`;
    return this.apiService.post(url, chart);
  }

  updateChart(id, chart) {
    const url = `${this.apiUrl}/chart/${id}`;
    return this.apiService.put(url, chart);
  }

  deleteChart(id) {
    const url = `${this.apiUrl}/chart/${id}`;
    return this.apiService.delete(url);
  }

  getGroups() {
    const url = `${this.apiUrl}/group`;
    return this.apiService.get(url);
  }

  createGroup(group) {
    const url = `${this.apiUrl}/group`;
    return this.apiService.post(url, group);
  }

  updateGroup(id, group) {
    const url = `${this.apiUrl}/group/${id}`;
    return this.apiService.put(url, group);
  }

  deleteGroup(id) {
    const url = `${this.apiUrl}/group/${id}`;
    return this.apiService.delete(url);
  }

  deleteGroupMember(employeeId, groupId) {
    const url = `${this.apiUrl}/group/member/${employeeId}/${groupId}`;
    return this.apiService.delete(url);
  }

  getAllLibrary() {
    const url = `${this.apiUrl}/report/all`;
    return this.apiService.get(url);
  }

  getAllLibraryByProject(projectId) {
    const url = `${this.apiUrl}/report/by_project/${projectId}`;
    return this.apiService.get(url);
  }

  getMyLibrary() {
    const url = `${this.apiUrl}/report/mine`;
    return this.apiService.get(url);
  }

  getGroupLibrary(projectId) {
    const url = `${this.apiUrl}/report/group?projectId=${projectId}`;
    return this.apiService.get(url);
  }

  getPublicLibrary() {
    const url = `${this.apiUrl}/report/public`;
    return this.apiService.get(url);
  }

  getChartsById(id, params) {
    const url = `${this.apiUrl}/report/${id}`;
    return this.apiService.get(url, params);
  }

  getAllEmployees() {
    const url = `${this.apiUrl}/employee`;
    return this.apiService.get(url);
  }

  shareToAll(id) {
    const url = `${this.apiUrl}/report/share-to-all/${id}`;
    return this.apiService.put(url);
  }

  toPrivate(id) {
    const url = `${this.apiUrl}/report/to-private/${id}`;
    return this.apiService.put(url);
  }

  shareToLibrary(reportId, groupId) {
    const url = `${this.apiUrl}/report/share-to-group/${reportId}/${groupId}`;
    return this.apiService.put(url);
  }

  forkReport(id) {
    const url = `${this.apiUrl}/report/fork/${id}`;
    return this.apiService.put(url);
  }

}
