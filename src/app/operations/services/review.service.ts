import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Review } from '../../shared/classes/review';
import { Contravention } from '../../shared/classes/contravention';
import { Challenge } from '../../shared/classes/challenge';

export type ValidateResponse = [Contravention, Review];
export type CreateChallengeResponse = [Contravention, Review, Challenge];

@Injectable()
export class ReviewService {
  constructor(
    private readonly apiService: ApiService
  ) {}

  public get(params: any = {}): Promise<any> {
    const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    const url = `/pg/cn-review?${queryString}`;

    return this.apiService.get(url);
  }

  public update(params: any= {}): Promise<any> {
    const url = `/pg/cn-review/${params.id}`;
    return this.apiService.put(url, params);
  }

  public create(params: Review): Promise<any> {
    const url = '/pg/cn-review';
    return this.apiService.post(url, params);
  }

  public delete(params: Review): Promise<any> {
    const url = `/pg/cn-review/${ params.id}`;
    return this.apiService.delete(url);
  }

  public validate(params: any = {}): Promise<ValidateResponse> {
    const url = `/pg/cn-review/validate/${params.id}`;
    return this.apiService.put(url, params);
  }

  public challenge(params: any = {}): Promise<CreateChallengeResponse> {
    const url = `/pg/cn-review/challenge/${params.id}`;
    return this.apiService.put(url, params);
  }
}
