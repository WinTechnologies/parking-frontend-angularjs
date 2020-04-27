import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from '../../../core/services/api.service';

@Injectable()
export class PromotionService {

  private promotionUrl = '/pg/promotions';

  private selectedProjects = new BehaviorSubject<string[]>(null);

  constructor(
    private apiService: ApiService,
  ) { }

  setSelectedProjects(projectIds) {
    this.selectedProjects.next(projectIds);
  }

  getSelectedProjects() {
    return this.selectedProjects;
  }

  createPromotion(promotion) {
    return this.apiService.post(this.promotionUrl, promotion);
  }

  getPromotions() {
    return this.apiService.get(this.promotionUrl);
  }

  getPromotion(promotionId) {
    const apiUrl = `${this.promotionUrl}/${promotionId}`;
    return this.apiService.get(apiUrl);
  }

  updatePromotion(promotion) {
    const apiUrl = `${this.promotionUrl}/${promotion.id}`;
    return this.apiService.put(apiUrl, promotion);
  }

  deletePromotion(promotionId) {
    const apiUrl = `${this.promotionUrl}/${promotionId}`;
    return this.apiService.delete(apiUrl);
  }
}
