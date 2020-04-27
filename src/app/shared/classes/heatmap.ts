export class Heatmap {
  date_y_parking: number;
  date_m_parking: number;
  date_d_parking: number;
  date_h_parking: number;
  date_min_parking: number;
  start_segment_txt: any;
  end_segment_txt: any;
  center_segment_txt: any;
  perc_time_occupation: number;

  constructor(date_y_parking: number = 0, date_m_parking: number = 0, date_d_parking: number = 0,
              date_h_parking: number = 0, date_min_parking: number = 0, start_segment_txt: any = '',
              end_segment_txt: any = '', center_segment_txt: any = '', perc_time_occupation: number = 0)
    {
      this.date_y_parking = date_y_parking;
      this.date_m_parking = date_m_parking;
      this.date_d_parking = date_d_parking;
      this.date_h_parking = date_h_parking;
      this.date_min_parking = date_min_parking;
      this.start_segment_txt = start_segment_txt;
      this.end_segment_txt = end_segment_txt;
      this.center_segment_txt = center_segment_txt;
      this.perc_time_occupation = perc_time_occupation;
  }
}
