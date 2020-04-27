import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Employee } from '../employees/models/employee.model';
import { ToastrService } from 'ngx-toastr';
import { AlertdialogComponent } from '../alertdialog/alertdialog.component';
import { ListTypeNote } from './models/list-type-note.model';
import { PgListTypeNoteService } from './service/list-type-note.service';
import { Note } from './models/note.model';
import { Project } from '../projects/models/project.model';
import { PgNoteService } from './service/note.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})

export class NotesComponent implements OnInit {
  @Input() employee: Employee;
  @Input() projects: Project[];
  @Input() employee_projects: Employee[];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  noteForm: FormGroup;
  notes: Note[];
  employeeId: any;

  projectId;
  isProjectAvailable = true;
  dataSource: MatTableDataSource<any>;
  displayedColumns = ['created_at', 'created_time', 'project',  'from_user_fullname', 'type_note', 'remarks', 'action'];

  listTypeNote: ListTypeNote[];

  constructor(
    private readonly noteService: PgNoteService,
    private formBuilder: FormBuilder,
    private readonly toastr: ToastrService,
    private readonly listTypeNoteService: PgListTypeNoteService,
    private dialog: MatDialog
  ) {

   }

  ngOnInit() {
    if(this.projects.length > 0) {
        this.projectId = this.projects[0].id;
        this.isEmployeeOnProject();
    }
    this.getEmployeeNotes(this.employee.employee_id);
    this.initNoteForm();
    this.listTypeNoteService.getWithNoEnforcementType().subscribe(listTypeNote => {
      this.listTypeNote = listTypeNote;
    });
  }

  initNoteForm() {
    this.noteForm = new FormGroup({
      project: new FormControl(''),
      listTypeNote: new FormControl(''),
      remarks: new FormControl(''),
    });
  }

  validateForm() {
    this.noteForm = this.formBuilder.group({
      project: [this.noteForm.value.project ? this.noteForm.value.project : '', [Validators.required]],
      listTypeNote: [this.noteForm.value.listTypeNote ? this.noteForm.value.listTypeNote : '', [Validators.required]],
      remarks: [this.noteForm.value.remarks ? this.noteForm.value.remarks : '', [Validators.required]],
    });
  }

  private isEmployeeOnProject(): void {
    this.isProjectAvailable = !!this.employee_projects.filter(el => el['project_id'] === this.projectId).length;
  }

  getEmployeeNotes(id: string) {
    this.noteService.getEmployeeNotes(id).subscribe( res => {
      this.notes = res;
      this.featchMatTable(this.notes);
    });
  }

  private featchMatTable(notes: Note[]): void {
    this.dataSource = new MatTableDataSource(notes);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'created_at': return new Date(item.created_at);
        case 'created_time': return (new Date(item.created_at).getHours() + new Date(item.created_at).getMinutes()) * 60;
        case 'project': return item.project_id;
        default: return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public applyFilterNote(filter: string) {
    filter = filter.trim().toLowerCase(); // Datasource defaults to lowercase matches
    if (this.dataSource) {
        this.dataSource.filter = filter;
    }
  }

  public onAddNote() {
    this.validateForm();
    if (this.noteForm.valid) {
      const formValue = this.noteForm.value;
      const newNote = new Note();
      newNote.sent_to = this.employee.employee_id;
      newNote.type_note = formValue.listTypeNote.type_note;
      newNote.remarks = formValue.remarks;
      newNote.project_id = formValue.project;

      this.noteService.addNote(newNote).subscribe(() => {
          this.initNoteForm();
          this.toastr.success(
            'The note is added successfully!',
            'success!'
          );
          this.getEmployeeNotes(this.employee.employee_id);
        }
      );
    } else {
      this.toastr.error(
        'Please fill all the fields',
        'Error!'
      );
    }
  }

  public onDelete(note: Note) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete this note?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.noteService.deleteNote(note.id).subscribe(() => {
          this.toastr.success(
            'The note is deleted successfully!',
            'Success!'
          );
          this.getEmployeeNotes(this.employee.employee_id);
        });
      }
    });
  }
}