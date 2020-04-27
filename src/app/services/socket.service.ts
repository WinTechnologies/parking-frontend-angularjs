import { Injectable, Inject } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { Agent } from '../shared/classes/agent';
import { Address } from '../shared/classes/address';
import { Job } from '../shared/classes/job';
import { Contravention } from '../shared/classes/contravention';
import { Enforcer } from '../components/generalview/model/enforcer';
import { HhdTracking } from '../shared/classes/hhd-tracking';

@Injectable()
export class SocketService {
    private socket;
    constructor(@Inject('API_ENDPOINT') private apiEndpoint: string) {
        // Add slice to remove '/api' from server url.
        this.socket = io(this.apiEndpoint.slice(0, -4));
    }

    public getMobileActiveUsers(): Observable<Enforcer> {
        return Observable.create((observer) => {
            this.socket.on('update_position', (message: any) => {
                if (message.info) {
                    try {
                        //let agentMapdata = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"properties\":{\"userType\":\"" + message.info.usertype + "\",\"markerIconsPath\":\"/assets/user-icons/\", \"user_id\":\"" + message.info.id + "\"},\"geometry\":{\"type\":\"Point\",\"coordinates\":[" + message.latitude + "," + message.longitude + "]}}]}";
                        // const agent = new Agent(agentMapdata, message.info.id, message.info.username, message.info.firstname, message.info.lastname, null, message.info.usertype, null, null, null, null, null, null, null);
                        const enforcer = new Enforcer(
                            message.latitude,
                            message.longitude,
                            message.info.firstname,
                            message.info.lastname,
                            message.info.phone,
                            message.info.project_id,
                            message.info.site_id,
                            message.info.user_id,
                            message.info.username,
                            message.info.usertype,
                            message.info.employee_id,
                            message.info.full_name,
                            message.info.project_name,
                            message.info.imei,
                            message.info.serial_number,
                            message.info.device_mode,
                            message.info.battery_status,
                            message.info.battery_level,
                            message.info.application_name,
                            message.info.user_status,
                            message.info.status_name,
                            message.info.position,
                            message.info.car_plate
                        );

                        observer.next(enforcer);
                    } catch (e) {
                        console.log('error: ', e.toString());
                        console.log('Error sync enforcer !');
                    }
                }
            });
        });
    }

    public getLogout(): Observable<Enforcer> {
        return Observable.create((observer) => {
            this.socket.on('logout', (message: any) => {
                if (message.info) {
                    try {
                        const enforcer = new Enforcer(
                            null,
                            null,
                            message.info.firstname,
                            message.info.lastname,
                            message.info.phone,
                            message.info.project_id,
                            message.info.site_id,
                            null,
                            message.info.username,
                            message.info.usertype,
                            message.info.employee_id,
                            null,
                            message.info.project_name,
                            message.info.user_imei,
                            null,
                            message.info.device_mode,
                            message.info.battery_status,
                            message.info.battery_level,
                            null,
                            message.info.user_status,
                            message.info.user_status_name,
                            null,
                            null
                        );
                        observer.next(enforcer);
                    } catch (e) {
                        console.log('error: ', e.toString());
                        console.log('Error sync enforcer !');
                    }
                }
            });
        });
    }


    /** GET jobs from the server in real time */
    public getRealTimeJobs(): Observable<Job[]> {
        return Observable.create((observer) => {
            this.socket.on('job_sync', (message) => {
                observer.next(message);
            });
        });
    }


    /** GET contraventions from the server in real time */
    public getRealTimeContraventions(): Observable<Contravention[]> {
        return Observable.create((observer) => {
            this.socket.on('contravention_sync', (message) => {
                observer.next(message);
            });
        });
    }
}