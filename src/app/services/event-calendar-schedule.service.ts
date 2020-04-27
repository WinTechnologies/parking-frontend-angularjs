
import {of as observableOf, Observable} from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Service for the schedule
 */
@Injectable()
export class EventCalendarScheduleService {
  /**
   * To get an Observable which contains all the events from 'fake' data
   * TODO to retrieve the events from the database
   */
  public getEvents(): Observable<any> {
    const dateObj = new Date();
    const yearMonth = dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1);
    console.log(yearMonth);
    const data: any = [{
      title: 'All Day Event',
      start: yearMonth + '-01'
    },
      {
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-01T08:00:00',
        end : yearMonth + '-01T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-03T08:00:00',
        end : yearMonth + '-03T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-04T08:00:00',
        end : yearMonth + '-04T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-05T08:00:00',
        end : yearMonth + '-05T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-06T08:00:00',
        end : yearMonth + '-06T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-07T08:00:00',
        end : yearMonth + '-07T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-08T08:00:00',
        end : yearMonth + '-08T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-10T08:00:00',
        end : yearMonth + '-10T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-11T08:00:00',
        end : yearMonth + '-11T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-12T08:00:00',
        end : yearMonth + '-12T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-13T08:00:00',
        end : yearMonth + '-13T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-14T08:00:00',
        end : yearMonth + '-14T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-15T08:00:00',
        end : yearMonth + '-15T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-18T08:00:00',
        end : yearMonth + '-18T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-19T08:00:00',
        end : yearMonth + '-19T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-20T08:00:00',
        end : yearMonth + '-20T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-21T08:00:00',
        end : yearMonth + '-21T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-25T08:00:00',
        end : yearMonth + '-25T18:00:00',
        color: '#105498'
      },
{
        title: 'EO Dammam Saudi Arabia Sample Only',
        start: yearMonth + '-26T08:00:00',
        end : yearMonth + '-26T18:00:00',
        color: '#105498'
      },
{
        title: 'Exception 1',
        start: yearMonth + '-24T08:00:00',
        end : yearMonth + '-24T12:00:00',
        color: 'red'
      },
{
        title: 'Exception 2',
        start: yearMonth + '-17T15:00:00',
        end : yearMonth + '-17T19:00:00',
        color: 'red'
      },
      {
        title: 'Exception 3',
        start: yearMonth + '-06T19:00:00',
        end : yearMonth + '-06T23:00:00',
        color: 'red'
      }];
    return observableOf(data);
  }
}

