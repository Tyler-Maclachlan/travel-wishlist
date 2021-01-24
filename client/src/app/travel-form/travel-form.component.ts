import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  ILocation } from '../api.service';

@Component({
  selector: 'app-travel-form',
  templateUrl: './travel-form.component.html',
  styleUrls: ['./travel-form.component.scss']
})
export class TravelFormComponent implements OnInit {
  public travelForm: FormGroup;

  @Input()
  public location: ILocation;

  @Output()
  public saveLocation = new EventEmitter<ILocation>();

  @Output()
  public close = new EventEmitter<boolean>();

  @Output()
  public deleteLocation = new EventEmitter<ILocation>();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.travelForm = this.formBuilder.group({
      title: [this.location.title || '', [Validators.required]],
      x: [this.location.x || 0, [Validators.required]],
      y: [this.location.y || 0, [Validators.required]]
    });
  }

  public onCancel() {
    this.close.emit(true);
  }

  public onDelete() {
    this.deleteLocation.emit(this.location);
  }

  public onSubmit() {
    if (this.travelForm.valid) {
      const location: ILocation = this.travelForm.value;

      this.saveLocation.emit({...this.location, ...location});
    }
  }
}
