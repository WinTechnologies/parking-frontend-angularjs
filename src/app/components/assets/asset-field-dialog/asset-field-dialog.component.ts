import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AssetFieldType, AssetField } from '../models/asset.model';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-asset-field-dialog',
  templateUrl: './asset-field-dialog.component.html',
  styleUrls: ['./asset-field-dialog.component.scss']
})

export class AssetFieldDialogComponent implements OnInit {
  AssetFieldType = AssetFieldType;
  form : FormGroup;
  isShowOptions: boolean;

  types: any [] =[
    { name: 'Text input', type: AssetFieldType.TextInput },
    { name: 'Calendar', type: AssetFieldType.Calendar },
    { name: 'Drop list', type: AssetFieldType.Droplist },
    { name: 'Checkbox list', type: AssetFieldType.CheckboxList },
  ];

  constructor(
    public dialogRef: MatDialogRef<AssetFieldDialogComponent>,
    private readonly formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  public get options(): FormArray {
		return this.form.get("options") as FormArray;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      options: this.formBuilder.array([
      ])
    });
    this.onAddOption('Yes');
    this.onAddOption('No');
  }

  public onAddOption(value?:string) {
    const formGroup = this.formBuilder.group(
      {
        option: new FormControl(value? value :'')
      }
    );
    this.options.push(formGroup);
  }

  private clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  public changeType(type: AssetFieldType) {
    if (type == AssetFieldType.Droplist || type == AssetFieldType.CheckboxList) {
      this.isShowOptions = true;
    } else {
      this.isShowOptions = false;
    }
  }

  public onDelete(index: number) {
      this.options.removeAt(index);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onAdd() {
    if (this.form.valid) {
      const formValue = this.form.value;
      let assetField : AssetField = new AssetField();
      assetField.name = formValue.name;
      assetField.type = formValue.type;
      assetField.options = formValue.options.map( v => {
        return v.option;
      });
      // remove empty value
      assetField.options = assetField.options.filter(v => v !== '');
      this.dialogRef.close(assetField);
    }
  }
}