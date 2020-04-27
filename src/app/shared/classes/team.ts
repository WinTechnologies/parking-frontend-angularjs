export class Team {
  id: string;
  typeteam: string;
  project_id: number;
  site_id: string;
  zone_id: string;
  members: string[];

  constructor() {
    this.members = [];
  }
}
