import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Observable, of} from "rxjs";

import {Period} from "../../shared/models/period.model";
import {BeveteliKategoria} from "../../shared/models/beveteliKategoria.model";

import {PERIODS} from "../../shared/database/period.database";
import {BEVTYPES} from "../../shared/database/bevtype.database";

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
  selector: 'app-bevetel-update',
  templateUrl: './bevetel-update.component.html',
  styleUrls: ['./bevetel-update.component.scss'],
  providers: [{
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
  },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    DatePipe]
})

//ez a dialógus ablak componens felel a bevételek frissítéséért
export class BevetelUpdateComponent implements OnInit {

  startdate = new FormControl('')
  enddate = new FormControl('')
  dp: any

  // session
  myid?: string

  // adatbázissal kapcsolatos változó
  periods = PERIODS
  basicBeveteliKat = BEVTYPES
  bevtypes: Observable<BeveteliKategoria[]> | undefined = of([]);

  // jelenlegi adatok
  title?: String
  period?: Period
  type?: BeveteliKategoria

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

  constructor(@Inject(MAT_DIALOG_DATA,) public data: {
                name: string,
                type: BeveteliKategoria, period: Period,
                value: number, id: string,
                userid: string,
                start: Timestamp,
                end: Timestamp
              },
              private datePipe: DatePipe,
              public dialogRef: MatDialogRef<BevetelUpdateComponent>,
              private afAuth: AngularFireAuth,
              private crudservice: CrudService) {
    this.title = "Hozzáadás"

  }

  async ngOnInit() {
    await this.afAuth.currentUser.then(x => {
      this.myid = x?.uid;
    });
    await this.getBeveteliKategoria(this.myid);


    this.loadPrevious()
  }

  //a form előállításához szükséges metódusok
  //függvény ami betölti a felhasználóhoz kapcsolódó bevételikategóriákat
  async getBeveteliKategoria(uid?: string) {
    this.bevtypes = this.crudservice.getBeveteliKategoria(uid);
  }

  // objektumok egyenlőségének összehasonlításához szükséges függvény
  compareObj(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }

  //létezik a paraméterben kapott bevételi típus?
  async exists(): Promise<void> {
    await new Promise(f => setTimeout(f, 200));
    this.basicBeveteliKat.forEach(item => {

      if (this.compareObj(item, this.data.type)) {
        this.valid += 1
        return
      }
    })

    if (this.bevtypes != undefined) {
      this.bevtypes.subscribe(x => {
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

  //formmódosító függvények
  //függvény ami betölti a régi adatokat a formba
  async loadPrevious() {

    if (this.data.id != undefined) {
      this.title = "Módosítás"
      this.period = this.data.period

      this.valid = 0

      await this.exists()
      if (this.valid > 0) {

        this.type = this.data.type
      } else {

        this.type = this.basicBeveteliKat[0]


        alert("A bevétel típúsa törlésre került, így azt kicseréltük!")
      }
      // console.log(this.data.start)
      // console.log(this.data.start.toDate())
      // console.log(new Date(this.data.start))
      // SimpleDateFormat sfd = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
      // sfd.format(new Date(timestamp));

      // console.log(new Date(this.data.start).toLocaleDateString("en-us"))


      this.updateForm.setValue({
          id: this.data.id,
          name: this.data.name,
          type: this.type,
          period: this.data.period,
          value: this.data.value,
          userId: this.data.userid,
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
    if (this.data.id == undefined) {
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
    } else {
      this.updateForm.setValue({
        id: this.data.id,
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
