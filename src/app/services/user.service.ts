import { Injectable, Inject } from '@angular/core';
import { User} from '../shared/classes/user';
import { Observable,  of } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {Address} from '../shared/classes/address';



const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class UserService {

  private usersUrl = `${this.apiEndpoint}/users`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET users from the server */
  getUsers(projectId: number): Observable<User[]> {
    return  this.http.get<User[]>(this.usersUrl, {params: {project_id: projectId.toString()}});
  }

  /** GET users from the server */
  getAllUsers(param): Observable<User[]> {
    return  this.http.get<User[]>(`${this.usersUrl}/get/all`, {params: param});
  }

  /** GET user from the server By Id */
  getUserById(userId: string): Observable<User[]> {
    return  this.http.get<User[]>(this.usersUrl, {params: {id: userId}});
  }

  /** GET users filtered by type */
  getUsersByType(userType: string, projectId: number): Observable<User[]> {
    return  this.http.get<User[]>(`${this.usersUrl}`, {params: {usertype: userType, project_id: projectId.toString()}});
  }

  /** GET users filtered by type */
  searchByUsername(username: string, projectId: number): Observable<User[]> {
    return  this.http.get<User[]>(`${this.usersUrl}`, {params: {username: username, project_id: projectId.toString()}});
  }

  getUsersBySites(sites: string[]): Observable<User[]> {
    return  this.http.post<User[]>(`${this.usersUrl}/getUsersBySites`, {sites: sites});
  }

  /** PUT: update the user on the server */
  updateUser (user): Observable<any> {
    return this.http.put(this.usersUrl, user, httpOptions);
  }

  /** PUT: assign a tow vehicle to user (Driver, Enforcer[EOD]) on the server */
  assignTowVehicleUser (user): Observable<any> {
    return this.http.put(`${this.usersUrl}/assign-tow-vehicle`, user, httpOptions);
  }

  /** POST: add a new user to the server */
  addUser (user: User): Observable<User> {
    return this.http.post<User>(this.usersUrl, user, httpOptions);
  }

  /** DELETE: delete the user from the server */
  deleteUser (user: User | string): Observable<User> {
    const id = typeof user === 'string' ? user : user.id;
    const url = `${this.usersUrl}?id=${id}`;

    return this.http.delete<User>(url, httpOptions);
  }

}
