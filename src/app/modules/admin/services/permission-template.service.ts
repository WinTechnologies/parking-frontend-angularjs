import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { PermissionTemplate } from '../models/permission-template.model';

const templateApiUrl = '/pg/admin/permission-templates';

@Injectable()
export class PermissionTemplateService {
  static createDefaultTemplate(features, defaultPermissionType) {
    const template = new PermissionTemplate();
    features.forEach(feature => {
      template[feature.feature] = defaultPermissionType;
    });
    return template;
  }

  constructor(
    private apiService: ApiService
  ) { }

  getTemplates() {
    return this.apiService.get(templateApiUrl);
  }

  getTemplate(id) {
    const apiUrl = `${templateApiUrl}/${id}`;
    return this.apiService.get(apiUrl);
  }

  createTemplate(template: PermissionTemplate) {
    return this.apiService.post(templateApiUrl, template);
  }

  updateTemplate(template: PermissionTemplate) {
    const apiUrl = `${templateApiUrl}/${template.id}`;
    return this.apiService.put(apiUrl, template);
  }

  deleteTemplate(templateId) {
    const apiUrl = `${templateApiUrl}/${templateId}`;
    return this.apiService.delete(apiUrl);
  }
}