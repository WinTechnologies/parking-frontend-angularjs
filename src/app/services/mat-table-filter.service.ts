import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

enum FilterDataValueType {
  Generic,
  Date,
  Select,
}

type FilterDataValue = string | number | boolean | Date;

interface FilterData {
  value: FilterDataValue[];
  valueType: FilterDataValueType;
}

export class Filter<T extends any> {
  globalFilter: string = null;
  globalFields: string[] = [];
  filters: { [key: string]: FilterData } = {};

  constructor(private dataSource: MatTableDataSource<T>) {
    this.dataSource.filterPredicate = (data) => this.predicate(data);
  }

  // return normalize value and strictness
  private static normalize(value) {
    if (value === null) {
      return [null, true];
    }

    // date
    if (value instanceof Date) {
      return [value, true];
    }

    // boolean
    if (value === true || value === false) {
      return [value, true];
    }

    // all other cast to string
    const v = value.toString().trim().toLowerCase();

    if (v === '') {
      return [null, true];
    }

    return [v, false];
  }

  private static isSame(base, search, strict = false) {
    const v1 = Filter.normalize(base);
    const v2 = Filter.normalize(search);

    if (v1[0] === null || v2[0] === null) {
      return false;
    }

    if (v1[1] === false && v2[1] === false && !strict) {
      return v1[0].indexOf(v2[0]) >= 0;
    }

    return v1[0] === v2[0];
  }

  private predicate(data: T) {
    if (this.globalFilter && this.globalFields.length > 0) {
      let exists = false;
      for (const [field, value] of Object.entries(data)) {
        if (!this.globalFields.includes(field)) {
          continue;
        }

        if (value && value.toString().toLowerCase().indexOf(this.globalFilter) >= 0) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        return false;
      }
    }

    for (const [column, filter] of Object.entries(this.filters)) {
      const value = Filter.normalize(data[column] || null)[0];

      let found = false;

      for (const v of filter['value']) {
        if (value === null && v === null) {
          found = true;
          continue;
        }

        if (value === null || v === null) {
          continue;
        }

        switch (filter['valueType']) {
          case FilterDataValueType.Generic:
            if (Filter.isSame(value, v)) {
              found = true;
            }

            break;
          case FilterDataValueType.Select:
            if (Filter.isSame(value, v, true)) {
              found = true;
            }

            break;
          case FilterDataValueType.Date:
            const d1 = moment(value);
            const d2 = moment(<Date>(v));

            if (d1.isSame(d2, 'day')) {
              found = true;
            }

            break;
        }
      }

      if (!found) {
        return false;
      }
    }

    return true;
  }

  private refresh() {
    this.dataSource.filter = JSON.stringify({
      globalFilter: this.globalFilter,
      filters: this.filters,
    });

    this.dataSource._updateChangeSubscription();
  }

  /**
   * @deprecated
   */
  public filterColumns(columns: any[]) {
    return columns.map(c => ({
      ...c,
      filter: c.name + '_filter',
    }));
  }

  /**
   * @deprecated
   */
  public filterDisplayColumns(columns: string[]) {
    return columns.map(c => c + '_filter');
  }

  public applySimpleFilter(text: string, fields: string[]) {
    this.globalFields = fields || [];

    if (text) {
      this.globalFilter = text.trim().toLowerCase();

      if (this.globalFilter === '') {
        this.globalFilter = null;
      }

      this.refresh();
      return;
    }

    this.globalFilter = null;
    this.refresh();
  }

  public applyColumnFilter(column: string, type: string, value: FilterDataValue) {
    let valueType = FilterDataValueType.Generic;

    switch (type) {
      case 'date':
        valueType = FilterDataValueType.Date;
        break;
      case 'select':
        valueType = FilterDataValueType.Select;
        break;
      default:
        break;
    }

    if (
      value === null ||
      (!Array.isArray(value) && Filter.normalize(value)[0] === null) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      if (Object.keys(this.filters).includes(column)) {
        delete this.filters[column];
        this.refresh();
      }

      return;
    }

    if (Array.isArray(value)) {
      this.filters[column] = {
        value: value.map(v => Filter.normalize(v)[0]),
        valueType,
      };
    } else {
      this.filters[column] = {
        value: [Filter.normalize(value)[0]],
        valueType,
      };
    }

    this.refresh();
  }
}

@Injectable()
export class MatTableFilterService {
  public createFilter<T>(dataSource: MatTableDataSource<T>): Filter<T> {
    return new Filter(dataSource);
  }
}
