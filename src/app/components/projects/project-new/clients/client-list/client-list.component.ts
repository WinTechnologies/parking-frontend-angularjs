import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { PgClientsService } from '../clients.service';
import { Client } from '../client.model';
import { MatDialog } from '@angular/material';
import { ClientNewComponent } from '../client-new/client-new.component';
import { ToastrService } from 'ngx-toastr';
import { AlertdialogComponent } from '../../../../alertdialog/alertdialog.component';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})

export class ClientListComponent implements OnInit, OnChanges {
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef;
  @Input() clients: Client[] = [];
  @Input() canUpdate = false;
  @Input() projectId: string;
  isMouseDownOnDragScroll = false;
  startX;
  scrollLeft;

  constructor(
    private readonly clientService: PgClientsService,
    private readonly toastr: ToastrService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) { }

  public moveLeft() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }

  public moveRight() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  public onMouseDownDragScroll(e) {
    this.isMouseDownOnDragScroll = true;
    this.startX = e.pageX - this.widgetsContent.nativeElement.offsetLeft;
    this.scrollLeft = this.widgetsContent.nativeElement.scrollLeft;
  }

  public onMouseLeaveDragScroll(e) {
    this.isMouseDownOnDragScroll = false;
  }

  public onMouseMoveDragScroll(e) {
    if (!this.isMouseDownOnDragScroll) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - this.widgetsContent.nativeElement.offsetLeft;
    const walk = (x - this.startX);
    this.widgetsContent.nativeElement.scrollLeft = this.widgetsContent.nativeElement.scrollLeft - walk;
  }

  public onAdd() {
    const dialogRef = this.dialog.open(ClientNewComponent, {
      width: '760px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clients.push(result);
        if (this.projectId) {
          this.toastr.info('Please click on update button to save all your modifications.');
        }
      }
    });
  }

  public onRemove(event: Event, client: Client, index: number) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete '  + client.firstname + ' ' + client.lastname + '?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clients.splice(index, 1);
        if (this.projectId) {
          this.toastr.info('Please click on update button to save all your modifications.');
        }
      }
    });
  }

  public onEdit(client: Client, index: number) {
    if (!this.canUpdate) {
      return;
    }
    const dialogRef = this.dialog.open(ClientNewComponent, {
      width: '760px',
      data: { client: client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (JSON.stringify(result) !== JSON.stringify(client)) {
          this.clients[index] = result;
          if (this.projectId) {
            this.toastr.info('Please click on update button to save all your modifications.');
          }
        }
      }
    });
  }

  private getClients(): void {
    this.clientService.get().subscribe(res => {
      this.clients = res;
    });
  }
}