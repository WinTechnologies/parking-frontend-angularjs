import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface ColumnDef {
  column_name: string;
  filter_name: string;
  column_label: string;
  is_show: boolean;
  is_nullable: boolean;
  can_update: boolean;
  ordinal_position: number;
  data_type: string;
  options: object;
}

@Injectable()
export class MatTableDefinitionService {
  public static TABLE_EMPLOYEE = 'employee';
  public static TABLE_EO = 'eo';
  public static TABLE_EOD = 'eod';
  public static TABLE_DRIVERS = 'drivers';

  private matTableDefinitionUrl = `${this.apiEndpoint}/pg/mat-table-definition`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
  }

  public getTableDef(tableName: string): Observable<ColumnDef[]> {
    return this.http.get<ColumnDef[]>(`${this.matTableDefinitionUrl}/${tableName}`);
  }

  public makeActionColumn(): ColumnDef {
    return {
      column_name: 'action',
      filter_name: 'action_filter',
      column_label: 'Action',
      is_show: true,
      is_nullable: false,
      can_update: false,
      ordinal_position: 9999,
      data_type: 'action',
      options: null,
    };
  }

  public updateTableDef(tableName: string, columns: ColumnDef[]) {
    const untilPost = new Subject<boolean>();
    this.http.post<ColumnDef[]>(`${this.matTableDefinitionUrl}/${tableName}`, columns)
      .takeUntil(untilPost)
      .subscribe(() => {
        untilPost.next(true);
        untilPost.complete();
      });
  }
}
