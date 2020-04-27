import { Injectable } from '@angular/core';

import { ApiService } from '../../core/services/api.service';
import { Challenge } from '../../shared/classes/challenge';
import { ChallengedCN, Contravention } from '../../shared/classes/contravention';
import { Review } from '../../shared/classes/review';

export type ValidateResponse = [Contravention, Review, Challenge];
export type RejectChallengeResponse = [Contravention, Challenge];

@Injectable()
export class ChallengeService {
  constructor(
    private readonly apiService: ApiService
  ) {}

  public get(params: any = {}): Promise<ChallengedCN[]> {
    const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    const url = `/pg/cn-challenge?${queryString}`;

    return this.apiService.get(url);
  }

  public update(params: any = {}): Promise<any> {
    const url = `/pg/cn-challenge/${params.id}`;
    return this.apiService.put(url, params);
  }

  public create(params: Challenge): Promise<any> {
    const url = '/pg/cn-challenge';
    return this.apiService.post(url, params);
  }

  public validate(params: any = {}): Promise<ValidateResponse> {
    const url = `/pg/cn-challenge/validate/${params.id}`;
    return this.apiService.put(url, params);
  }

  public reject(params: any = {}): Promise<RejectChallengeResponse> {
    const url = `/pg/cn-challenge/reject/${params.id}`;
    return this.apiService.put(url, params);
  }
}
