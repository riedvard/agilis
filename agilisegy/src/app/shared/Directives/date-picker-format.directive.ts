import {Directive, Inject, Input, Optional} from '@angular/core';
import {NgControl} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {CustomDateFormat, DateDisplay, DateParse} from "../models/custom-date-format";

@Directive({
  selector: '[datePickerFormat]',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useClass: CustomDateFormat
    }
  ]
})
export class DatePickerFormatDirective {
  @Input() public configDateParse?: DateParse;
  @Input() public configDateDisplay?: DateDisplay;

  constructor(
    @Inject(MAT_DATE_FORMATS) public matDateFormat: CustomDateFormat,
    @Optional() private ngControl: NgControl
  ) {
  }

  @Input('datePickerFormat')
  set datePickerFormat(format: string) {
    if (this.configDateParse) {
      this.matDateFormat.updateDateFormat(
        this.configDateParse,
        this.configDateDisplay
      );
    } else {
      this.matDateFormat.updateDateFormat({dateInput: format});
    }
    // We need this for the first time to tell component change new format
    const value = this.ngControl.value;
    this.ngControl.valueAccessor?.writeValue(value);
  }
}
