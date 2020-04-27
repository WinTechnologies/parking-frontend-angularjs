import { Component, ElementRef, ViewChild, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PgOrgChartService } from '../../../services/org-chart.service';
import { Employee } from '../../../components/employees/models/employee.model';
import { LoaderService } from '../../../services/loader.service';

declare var $: any;

const OrgChart_CONST = {
  CEO: 'CEO'
};

@Component({
  selector: 'app-org-chart',
  templateUrl: 'org-chart.component.html',
  styleUrls: ['org-chart.component.scss']
})
export class OrgChartComponent implements OnDestroy, OnInit {

  ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('org_chart') tref: ElementRef;

  @Input() employee: Employee;
  @Input() set projectId(value: number) {
    this.hasManager = true;
    this._projectId = value;
    this.updateOrgChart(value);
  }
  get projectId() {
    return this._projectId;
  }
  @Input() projectName: string;
  @Input() employeesCount: number;
  @Output() switchTabEvent = new EventEmitter<number>();

  _projectId: number;
  isOrgChartAvailable = true;
  datasource;
  orgChart;

  listUsers = [];
  query = '';
  isShowSidebar = true;

  fullName: string;
  eventOnDragOver: any;
  currentDeleted;
  highlight: any;

  hasManager = true;
  matTooltipText = 'Put employee over employee on chart to add employee to the hierarchy';
  userGuideTooltipText = `If org.chart is not available, User adds a first employee as head of the org.chart by drag and drop the employee badges from the list on the right, who has highest responsibility on the project.
  Once the head of the org.chart is defined. User continues to add other employees according to their ranks in hierarchy.
  To define employee Y is directly under the supervision of employee X, user drag the employee Y badge on the right and drop it on the badge of employee X in the chart.`;

  emptyHeadOfProject = {
    className: 'add_employee',
    employee_id: 'ADD_HEAD',
    fullname: 'Add Head of project',
    position: 'DRAG HERE',
  };
  emptyManager = {
    className: 'add_employee',
    employee_id: 'ADD_MANAGER',
    fullname: 'Add Staff',
    position: 'DRAG TO PREVIOUS',
  };
  emptySupervisor = {
    className: 'no-dragged-user add_employee',
    employee_id: 'ADD_SUPERVISOR',
    fullname: 'Add Staff',
    position: 'DRAG TO PREVIOUS',
  };

  // Permission Feature
  @Input() canUpdate = false;

  constructor(
    private loaderService: LoaderService,
    private pgOrgChartService: PgOrgChartService,
  ) {
  }

  ngOnInit() {
    this.isShowSidebar = this.canUpdate;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addDragStartHandler(): void {
    if (this.canUpdate) {
      $('.dragged-user').attr('draggable', true);
      $('.dragged-user').unbind('dragstart');
      $('.dragged-user').on('dragstart', (ev) => {
        this.currentDeleted = ev.target;
      });
      if (this.employee && this.employee.employee_id) {
        $('#' + this.employee.employee_id).addClass('added-user dragged-user');
      }
    }
  }

  updateOrgChart(value): void {
    this.pgOrgChartService.get({ project_id: value })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res && this.employeesCount > 0) {
          this.isOrgChartAvailable = true;
          if (this.tref) {
            $(this.tref.nativeElement).empty();
          }
          this.initChart(res);
        } else if (this.employeesCount === 0 || !res) {
          this.isOrgChartAvailable = false;
          setTimeout(() => {
            this.switchTabEvent.emit(0);
          }, 2500);
        }
      },
        _ => {
          this.isOrgChartAvailable = false;
          setTimeout(() => {
            this.switchTabEvent.emit(0);
          }, 2500);
        }
      );
  }

  selectCurrentEmployee(data, elemId) {
    if (data.children) {
      data.children.forEach((element) => {
        if (element.employee_id === elemId) {
          // this.listUsers = [];
          element['className'] = 'dragged-user added-user';
        } else {
          this.selectCurrentEmployee(element, elemId);
        }
      });
    }
  }

  initChart(res): void {
    if (!res.hierarchy || !res.hierarchy.hasOwnProperty('employee_id')) {
      this.datasource = this.emptyHeadOfProject;
    } else {
      this.datasource = res.hierarchy;
      this.datasource['className'] = 'dragged-user';
      if (!this.datasource.children) {
        this.hasManager = false;
        this.datasource['children'] = [this.emptyManager];
      }
    }
    this.createRightSideList(res);
    if (this.hasManager && this.datasource.children && this.hasSupervisor(this.datasource.children[0])) {
      this.addClass(this.datasource);
    }
    this.buildingChart();
  }

  initHead(data): void {
    this.datasource = data;
    this.hasManager = false;
    if (data.employee_id !== 'ADD_HEAD') {
      this.datasource['children'] = [this.emptyManager];
    }
    this.buildingChart();
  }

  createRightSideList(res) {
    if (this.employee) {
      const isInHierarchy = !res.employees.find(employee => employee.employee_id === this.employee.employee_id);
      if (!isInHierarchy) {
        this.fullName = `${this.employee.firstname} ${this.employee.lastname}`;
        this.listUsers = [{
          'fullname': this.fullName,
          'position': this.employee.job_position,
          'className': 'dragged-user',
          'employee_id': this.employee.employee_id
        }];
        this.isShowSidebar = this.canUpdate;
      } else {
        this.isShowSidebar = false;
        this.listUsers = [];
      }
      this.selectCurrentEmployee(this.datasource, this.employee.employee_id);
    } else {
      this.listUsers = res.employees;
    }
  }

  nodeTemplate(data) {
    return `
      <div class="d-flex flex-row align-items-center">
          <img class="d-block " draggable="false" src="assets/noavatar.png" alt="img">
          <div class="d-block pl-1 text-left">
            <span style="font-weight: bold; font-size: 11px;" draggable="false">${data.fullname}</span><br/>
            <span style="font-size: 11px;" draggable="false" class="position">${data.position}</span>
          </div>
      </div>
    `;
  }

  buildingChart(): void {
    $('#org_chart').empty();
    if (this.tref) {
      this.orgChart = $(this.tref.nativeElement).orgchart({
        'data': this.datasource,
        'nodeId': 'employee_id',
        'pan': true,
        'nodeContent': 'title',
        'nodeTemplate': this.nodeTemplate,
        'verticalLevel': 4
      });
    }
  }

  addNode(data, element_id: string, target_elem, position: string): void {
    if (this.listUsers.find(us => us.employee_id === target_elem.id)) {
      const elementFromRightList = this.listUsers.find(el => el.employee_id === $(target_elem).prop('id'));
      let a_user;
      a_user = {
        'fullname': $(target_elem).find('.fullname').text(),
        'position': position,
        'className': 'dragged-user added-user',
        'employee_id': elementFromRightList.employee_id
      };
      this.determineTypeOfAddition(data, element_id, a_user, elementFromRightList, target_elem, position);
      $(target_elem).remove();
    }
  }

  determineTypeOfAddition(data, element_id, a_user, elementFromRightList, target_elem, position) {
    if (data.employee_id === 'ADD_HEAD') {
      this.setHeadOfProject(elementFromRightList);
    } else if (data.employee_id === element_id && (data.level === 1) && this.hasManager) {
      this.addChildToManager(a_user, data, elementFromRightList);
    } else if (data.children && this.hasManager) {
      this.searchEmployee(data, element_id, a_user, elementFromRightList, target_elem, position);
    } else if (!this.hasManager) {
      this.addChildToManager(a_user, data, elementFromRightList, true);
    }
    this.deleteNode(data, 'ADD_MANAGER');
  }

  setHeadOfProject(elementFromRightList) {
    this.addToProject(this.projectId, elementFromRightList.employee_id, OrgChart_CONST.CEO);
    this.listUsers.splice(this.listUsers.indexOf(elementFromRightList), 1);
    this.initHead({ ...elementFromRightList, className: 'dragged-user added-user' });
  }

  searchEmployee(data, element_id, added_user, elementFromRightList, target_elem, position) {
    data.children.forEach((element, index, array) => {
      if (element.employee_id === element_id) {
        if ((!this.hasSupervisor(array) && element.level === 3) || element.level > 3) {
          this.addSiblingToEmployeeList(added_user, element, elementFromRightList, index, array);
        } else if (element.level <= 3) {
          this.addChildToManager(added_user, element, elementFromRightList);
        }
      } else {
        this.addNode(element, element_id, target_elem, position);
      }
    });
  }

  addChildToManager(added_user, element, supervisor, isFirstManager?: boolean) {
    added_user['supervisor_id'] = element.employee_id;
    if (isFirstManager) {
      const emptyEmployee = this.emptySupervisor;
      emptyEmployee['supervisor_id'] = added_user.employee_id;
      added_user['children'] = [emptyEmployee];
      this.hasManager = isFirstManager;
    }

    if (element.children) {
      if (!this.hasSupervisor(element.children)) {
        element.children = [];
      }
      element.children.unshift(added_user);
    } else {
      element.children = [added_user];
    }
    this.addToProject(this.projectId, supervisor.employee_id, element.employee_id);
    this.listUsers.splice(this.listUsers.indexOf(supervisor), 1);
    this.deleteNode(element, 'ADD_MANAGER');
  }

  addSiblingToEmployeeList(a_user, element, elem, position, array) {
    a_user['supervisor_id'] = element.supervisor_id;
    array.splice(position + 1, 0, a_user);
    this.addToProject(this.projectId, elem.employee_id, element.supervisor_id);
    this.listUsers.splice(this.listUsers.indexOf(elem), 1);
  }

  deleteNode(data, elemId: string): void {
    if (data.children) {
      data.children.forEach((element, index, array) => {
        if (element.employee_id === elemId) {
          const level = element.level;
          const supervisor_id = element.supervisor_id;
          array.splice(array.indexOf(element), 1);
          this.listUsers.push(element);
          if (array.length === 0) {
            if (level === 2) {
              array.push(this.emptyManager);
              this.hasManager = false;
            } else if (level === 3) {
              const empty = this.emptySupervisor;
              empty['supervisor_id'] = supervisor_id;
              array.push(this.emptySupervisor);
            }
          }
        } else {
          this.deleteNode(element, elemId);
        }
      });
    }
  }

  dragover(ev): void {
    if (!this.canUpdate) {
      return;
    }
    this.eventOnDragOver = ev;
    this.highlight = null;
    ev.dataTransfer.dropEffect = 'copy';
    ev.preventDefault();
    $('.highlight').remove();
    if (ev.target.closest('li')) {
      if (!this.highlight && this.currentDeleted) {
        this.highlight = $(ev.target.closest('li')).parent().append('<li class="highlight"></li>');
      }
    }
  }

  dragoverBack(ev): void {
    ev.preventDefault();
  }

  addHandler(event, context) {
    const targetEl = context.eventOnDragOver.target;
    if (targetEl && targetEl.closest('.node') && !$(targetEl.closest('.node')).hasClass('no-dragged-user') && !targetEl.closest('#r_container')) {
      this.addNodeOnDragend(context, targetEl.closest('.node').id, event.target.closest('.node'), $(event.target).find('.position').text());
    } else if ($(targetEl).has('.node') && (targetEl.childNodes[0]) && (targetEl.childNodes[0].id)) {
      this.addNodeOnDragend(context, targetEl.childNodes[0].id, event.target.closest('.node'), $(event.target).find('.position').text());
    }
  }

  private addNodeOnDragend(context, employee_id, node, position) {
    context.addNode(context.datasource, employee_id, node, position);
    context.buildingChart();
  }

  dropBack(event): void {
    if (this.currentDeleted) {
      if (this.currentDeleted.closest('.node').id === this.datasource.employee_id) {
        this.initHead(this.emptyHeadOfProject);
        this.removeFromProject(this.projectId, this.currentDeleted.closest('.node').id);
        return;
      }
      this.deleteDataFromProject(this.datasource, this.currentDeleted.closest('.node').id);
      this.deleteNode(this.datasource, this.currentDeleted.closest('.node').id);
      const that = this;
      $('#r_container .dragged-user').unbind('dragend');
      $('#r_container .dragged-user').on('dragend', function (ev) {
        that.addHandler(ev, that);
      });
      this.currentDeleted = null;
    }

    this.buildingChart();
  }

  deleteDataFromProject(data, employee_id) {
    if (data.children) {
      data.children.forEach((element) => {
        if (element.employee_id === employee_id) {
          this.removeFromProject(this.projectId, element.employee_id);
        } else {
          this.deleteDataFromProject(element, employee_id);
        }
      });
    }
  }

  dragend(event): void {
    this.addHandler(event, this);
  }

  onOrgChartReset(): void {
    this.orgChart.init({
      'data': this.datasource,
      'nodeId': 'employee_id',
      'pan': true,
      'nodeContent': 'title',
      'nodeTemplate': this.nodeTemplate,
      'verticalLevel': 4
    });
  }

  toggleRightPart() {
    this.isShowSidebar = !this.isShowSidebar;
  }

  private addClass(data) {
    // data['className'] = (data.level < 3) ? 'no-dragged-user' : (data.level === 3) ? '' : (this.employee ? '' : 'dragged-user');
    data['className'] = this.employee ? '' : 'dragged-user';
    if (data.children) {
      data.children.forEach((element) => {
        this.addClass(element);
      });
    }
  }

  private addToProject(projectId, employeeId, supervisorId) {
    this.loaderService.enable();
    const request = {
      project_id: projectId,
      employee_id: employeeId,
      supervisor_id: supervisorId
    };
    this.pgOrgChartService.add(request)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.loaderService.disable();
        this.updateOrgChart(this._projectId);
      });
  }

  private hasSupervisor(data) {
    return !(data.length === 1 && data[0] && data[0]['employee_id'] === 'ADD_SUPERVISOR');
  }

  private removeFromProject(projectId, employeeId) {
    this.loaderService.enable();
    const request = {
      project_id: projectId,
      employee_id: employeeId,
      supervisor_id: null
    };
    this.pgOrgChartService.delete(request)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.loaderService.disable();
        this.updateOrgChart(this._projectId);
      });
  }
}
