export interface CodeDepartment {
  id: number;
  department_code: string;
  department_name: string;
}

export interface CodeCity {
  id: number;
  city_code: number;
  city_name: string;
  city_code_pin: string;
}

export interface CodePosition {
  id: number;
  position_code: string;
  position_name: string;
}

export interface CodeVat {
  id: number;
  vat_code: string;
  vat_percentage: string;
  vat_country: string;
  vat_name: string;
}

export type CodeTypes = CodeDepartment | CodeCity | CodePosition | CodeVat;
