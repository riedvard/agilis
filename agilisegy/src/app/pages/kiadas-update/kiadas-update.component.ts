import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Observable, of} from "rxjs";

import {KiadasiKategoria} from "../../shared/models/kiadasiKategoria.model";
import {Period} from "../../shared/models/period.model";

import {PERIODS} from "../../shared/database/period.database";
import {KIADTYPES} from "../../shared/database/kiadtype.database";

import {CrudService} from "../../shared/services/crud.service";

import {MatDatepicker} from "@angular/material/datepicker";
import * as moment from "moment";
import {Moment} from "moment";
import {DatePipe} from "@angular/common";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from "@angular/material-moment-adapter";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;


export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-kiadas-update',
  templateUrl: './kiadas-update.component.html',
  styleUrls: ['./kiadas-update.component.scss'],
  providers: [{
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
  },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    DatePipe]
})


//ez a dialógus ablak componens felel a kiadások frissítéséért
export class KiadasUpdateComponent implements OnInit {

  startdate = new FormControl('')
  enddate = new FormControl('')
  dp: any

  //session
  myid?: string

  // adatbázissal kapcsolatos változó
  periods = PERIODS
  basicKiviteliKat = KIADTYPES
  kiadtypes: Observable<KiadasiKategoria[]> | undefined = of([]);

  // jelenlegi adatok
  title?: String
  period?: Period
  typee?: KiadasiKategoria

  // type létezik?
  valid = 0

  //form
  updateForm = new FormGroup(
    {
      id: new FormControl(''),
      name: new FormControl(''),
      type: new FormControl(''),
      period: new FormControl(''),
      value: new FormControl(''),
      userId: new FormControl(''),
      startDate: this.startdate,
      endDate: this.enddate
    });

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
                name: string,
                type: KiadasiKategoria,
                period: Period,
                value: number,
                id: string,
                userid: string,
                start: Timestamp,
                end: Timestamp
              },
              public dialogRef: MatDialogRef<KiadasUpdateComponent>,
              private afAuth: AngularFireAuth,
              private crudservice: CrudService,
              private datePipe: DatePipe,
  ) {
    this.title = "Hozzáadás"
  }

  async ngOnInit() {
    await this.afAuth.currentUser.then(x => {
      this.myid = x?.uid;
    });
    await this.getKiadasiKategoria(this.myid);


    this.loadPrevious()
  }

  //a form előállításához szükséges metódusok
  //függvény ami betölti a felhasználóhoz kapcsolódó kiadásikategóriákat
  async getKiadasiKategoria(uid?: string) {
    this.kiadtypes = this.crudservice.getKiadasiKategoria(uid);
  }

  // objektumok egyenlőségének összehasonlításához szükséges függvény
  compareObj(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }


  //formmódosító függvények
  //függvény ami betölti a régi adatokat a formba
  async loadPrevious() {
    if (this.data.id != undefined) {

      this.title = "Módosítás"
      this.period = this.data.period

      this.valid = 0
      await this.exists()
      if (this.valid > 0) {
        this.typee = this.data.type

      } else {
        this.typee = this.basicKiviteliKat[0]
        alert("A kiadás típúsa törlésre került, így azt kicseréltük!")
      }

      this.updateForm.setValue({
          id: this.data.id,
          name: this.data.name,
          type: this.typee,
          period: this.data.period,
          value: this.data.value,
          userId: this.myid,
          startDate: this.startdate,
          endDate: this.enddate
        }
      )
      this.startdate.setValue(this.data.start.toDate());
      this.enddate.setValue(this.data.end.toDate());

    } else {
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      this.startdate.setValue(firstDay);
      this.enddate.setValue(firstDay);
      this.updateForm.setValue({
        id: '',
        name: '',
        type: '',
        period: '',
        value: '',
        userId: this.data.userid,
        startDate: this.startdate,
        endDate: this.enddate
      })
    }
  }

  //függvény ami kiüríti a formot
  clear() {
    if (this.data.id != undefined) {
      this.updateForm.setValue({
          id: this.data.id,
          name: '',
          type: '',
          period: '',
          value: '',
          userId: this.data.userid,
          startDate: this.startdate,
          endDate: this.enddate
        }
      )
    } else {
      this.updateForm.setValue({
        id: '',
        name: '',
        type: '',
        period: '',
        value: '',
        userId: this.data.userid,
        startDate: this.startdate,
        endDate: this.enddate
      })
    }
  }

  //létezik a paraméterben kapott kiadás típus?
  async exists(): Promise<void> {
    await new Promise(f => setTimeout(f, 200));
    this.basicKiviteliKat.forEach(item => {
      if (this.compareObj(item, this.data.type)) {
        this.valid += 1
        return
      }
    })

    if (this.kiadtypes != undefined) {
      this.kiadtypes.subscribe(x => {
        x.forEach(item => {
          if (this.compareObj(item, this.data.type)) {
            this.valid += 1
            return
          }
        })
      })
    }
    await new Promise(f => setTimeout(f, 200));
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>, date: FormControl) {
    const ctrlValue = date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    date.setValue(ctrlValue);
    datepicker.close();
  }

  setYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>, date: FormControl) {
    const ctrlValue = date.value!;
    ctrlValue.year(normalizedMonthAndYear.year());
    date.setValue(ctrlValue);
    datepicker.close();
  }

  close() {

    this.startdate.setValue(moment(this.startdate.value).toDate())
    if (this.period?.id == 0) {
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      this.enddate.setValue(firstDay);
    }
    this.enddate.setValue(moment(this.enddate.value).toDate())

    this.dialogRef.close(this.updateForm.value)
  }

}
