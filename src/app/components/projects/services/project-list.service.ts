import { Injectable } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Subject } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable()
export class ProjectListService {
  private activeProject: Subject<Project> = new Subject<Project>();
  private inactiveProject: Subject<Project> = new Subject<Project>();

  constructor (
    private storageService: StorageService,
  ) { }

  setActiveProject(project: Project) {
    this.activeProject.next(project);
  }

  getActiveProject(): Subject<Project> {
    return this.activeProject;
  }

  setInactiveProject(project: Project) {
    this.inactiveProject.next(project);
  }

  getInactiveProject(): Subject<Project> {
    return this.inactiveProject;
  }

  setStorage(data) {
    this.storageService.save(this.getStorageKey(), data);
  }

  getStorage() {
    return this.storageService.get(this.getStorageKey());
  }

  removeStorage() {
    this.storageService.remove(this.getStorageKey());
  }

  private getStorageKey() {
    return 'projects/list';
  }
}