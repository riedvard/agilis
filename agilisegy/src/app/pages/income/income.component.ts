import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from "@angular/material/dialog";
import {map, Observable, of} from "rxjs";


import {Bevetel} from '../../shared/models/bevetel.model';
import {Kiadas} from '../../shared/models/kiadas.model';
import {KiadasiKategoria} from "../../shared/models/kiadasiKategoria.model";
import {BeveteliKategoria} from "../../shared/models/beveteliKategoria.model";
import {Period} from "../../shared/models/period.model";

import {BEVTYPES} from '../../shared/database/bevtype.database';
import {KIADTYPES} from '../../shared/database/kiadtype.database';
import {PERIODS} from '../../shared/database/period.database';

import {BevetelUpdateComponent} from "../bevetel-update/bevetel-update.component";
import {KiadasUpdateComponent} from "../kiadas-update/kiadas-update.component";

import {CrudService} from '../../shared/services/crud.service';

import * as moment from "moment";
import {Moment} from "moment";
import firebase from "firebase/compat";
import {MatDatepicker} from "@angular/material/datepicker";
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})

//ez a componens listázza a bevételeket kiadásokat, és számolja ki a rendelkezésre álló költségkeretet
export class IncomeComponent implements OnInit {

  // session
  myid ? = '';
  selectedPeriod: Period

  // adatbázissal kapcsolatos változok
  periods = PERIODS;
  basicKiadasiKat = KIADTYPES;
  basicBeveteliKat = BEVTYPES;
  bevtypes: Observable<BeveteliKategoria[]> | undefined = of([]);
  kiadtypes: Observable<KiadasiKategoria[]> | undefined = of([]);
  bevetels: Observable<Bevetel[]> | undefined = of([]);
  kiadasok: Observable<Kiadas[]> | undefined = of([]);
  bontasok: Period[];

  // kiszámolandó változók
  allBevetel: number;
  allKiadas: number;

  //dátumválasztó formcontrollok
  startdate = new FormControl('')

  // formok
  bevetelForm = new FormGroup(
    {
      name: new FormControl(''),
      type: new FormControl(''),
      period: new FormControl(''),
      value: new FormControl(''),
      userId: new FormControl('')
    });

  kiadasForm = new FormGroup(
    {
      name: new FormControl(''),
      type: new FormControl(''),
      period: new FormControl(''),
      value: new FormControl(''),
      userId: new FormControl('')
    });

  bontasForm = new FormGroup(
    {
      period: new FormControl(''),
    });

  constructor(private afAuth: AngularFireAuth,
              private formBuilder: FormBuilder, private crudservice: CrudService, private dialog: MatDialog) {
    this.allBevetel = 0
    this.allKiadas = 0
    this.bontasok = []
    PERIODS.forEach((value, index) => {
      if (value.id != 0) {
        this.bontasok.push(value)
      }
    })
    this.selectedPeriod = this.bontasok[1]
  }


  async ngOnInit() {
    this.setCurrentDate()
    this.allBevetel = 0
    this.allKiadas = 0
    this.kiadasok
    await this.afAuth.currentUser.then(x => {
      this.myid = x?.uid;
    });
    await this.getBevetel(this.myid);
    await this.getKiadasok(this.myid);

    this.bevtypes = this.crudservice.getBeveteliKategoria(this.myid);
    this.kiadtypes = this.crudservice.getKiadasiKategoria(this.myid);

    this.getAllBevetel()
    this.getAllKiadas()

  }

  includes(one: Date, two: Date[], kind: String): Boolean {
    if (kind == "y") {
      // @ts-ignore
      two.forEach(item => {
          if (item.getFullYear() == one.getFullYear()) {
            return true
          }
        }
      )
      return false
    } else if (kind == "m") {
      // @ts-ignore
      two.forEach(item => {
          if (item.getMonth() == one.getMonth()) {
            return true
          }
        }
      )
      return false
    } else if (kind == "d") {
      // @ts-ignore
      two.forEach(item => {
          if (item.getDate() == one.getDate()) {
            return true
          }
        }
      )
      return false
    }
    return false
  }

  //dátum számításokhoz szükséges metódus
  isBetween(mstart: Date, mend: Date, start: Date, end: Date) {
    return (mstart <= start || mstart <= end) && (mend >= start || mend >= end);
  }

  //dátum számításokhoz szükséges metódus
  getDates(one: Date, two: Date, num: number): Date[] {
    let dates = [];
    let currentDate = one;
    while (currentDate <= two) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + num);
    }

    return dates;
  }

  setCurrentDate() {
    this.startdate.setValue(moment().toDate())
  }

  update() {
    this.getAllBevetel()
    this.getAllKiadas()
    this.sortKiads()
    this.sortBevs()
  }

  // megjelenítéssel kapcsolatus függvények:
  // periódikusságra számoló függvény
  getHavi(bev: Bevetel) {
    let value = 0
    let currentDate = moment(this.startdate.value)
    let weekStart = currentDate.clone().startOf('isoWeek');
    let monthStart = currentDate.clone().startOf('month');
    let yearStart = currentDate.clone().startOf('year');
    let weekEnd = currentDate.clone().endOf('isoWeek');
    let monthEnd = currentDate.clone().endOf('month');
    let yearEnd = currentDate.clone().endOf('year');


    let dates: Date[] = [];

    let start = bev.startDate.toDate()
    let end = bev.endDate.toDate()

    let mstart = moment(start).clone().startOf('isoWeek');
    let mend = moment(end).clone().endOf('isoWeek');

    //heti bontás
    if (this.selectedPeriod.id == 1) {

      switch (bev.period.id) {
        case 0:

          if (start >= weekStart.toDate() && start <= weekEnd.toDate()) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 1:
          mstart = moment(start).clone().startOf('isoWeek');
          mend = moment(end).clone().endOf('isoWeek');

          if (mstart <= weekStart && mend >= weekEnd) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 2:
          mstart = moment(start).clone().startOf('month');
          mend = moment(end).clone().endOf('month');
          if (this.isBetween(mstart.toDate(), mend.toDate(), weekStart.toDate(), weekEnd.toDate())) {
            value = bev.value / 4
          } else {
            value = 0
          }

          break;
        case 3:
          mstart = moment(start).clone().startOf('year');
          mend = moment(end).clone().endOf('year');
          if (this.isBetween(mstart.toDate(), mend.toDate(), weekStart.toDate(), weekEnd.toDate())) {
            value = bev.value / 52
          } else {
            value = 0
          }
          break;
        case 4:
          dates = this.getDates(start, end, 1)

          dates.forEach(item => {
            if (item >= weekStart.toDate() && item <= weekEnd.toDate()) {
              value += bev.value
            }
          })

      }

      //éves bontás
    } else if (this.selectedPeriod.id == 3) {
      switch (bev.period.id) {
        case 0:

          if (start >= yearStart.toDate() && start <= yearEnd.toDate()) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 1:
          mstart = moment(start).clone().startOf('isoWeek');
          mend = moment(end).clone().endOf('isoWeek');
          dates = this.getDates(mstart.toDate(), mend.toDate(), 7)

          dates.forEach(item => {
            if (item >= yearStart.toDate() && item <= yearEnd.toDate()) {
              value += bev.value
            }
          })
          break;
        case 2:
          mstart = moment(start).clone().startOf('month');
          mend = moment(end).clone().endOf('month');
          dates = this.getDates(mstart.toDate(), mend.toDate(), 31)

          dates.forEach(item => {
            if (item >= yearStart.toDate() && item <= yearEnd.toDate()) {
              value += bev.value
            }
          })
          break;
        case 3:

          if (start.getFullYear() <= yearStart.toDate().getFullYear() && end.getFullYear() >= yearEnd.toDate().getFullYear()) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 4:
          dates = this.getDates(start, end, 1)

          dates.forEach(item => {
            if (item.getFullYear() >= yearStart.toDate().getFullYear() && item.getFullYear() <= yearEnd.toDate().getFullYear()) {
              value += bev.value
            }
          })

      }
      //napi bontás
    } else if (this.selectedPeriod.id == 4) {
      switch (bev.period.id) {
        case 0:
          if (start.getDate() == currentDate.toDate().getDate() && start.getFullYear() == currentDate.toDate().getFullYear() && start.getMonth() == currentDate.toDate().getMonth()) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 1:
          mstart = moment(start).clone().startOf('isoWeek');
          mend = moment(end).clone().endOf('isoWeek');

          if (mstart.toDate() <= currentDate.toDate() && mend.toDate() >= currentDate.toDate()) {
            value = bev.value / 7
          } else {
            value = 0
          }
          break;
        case 2:
          mstart = moment(start).clone().startOf('month');
          mend = moment(end).clone().endOf('month');
          if (mstart.toDate() <= currentDate.toDate() && mend.toDate() >= currentDate.toDate()) {
            value = bev.value / 30
          } else {
            value = 0
          }
          break;
        case 3:
          if (start.getFullYear() <= currentDate.toDate().getFullYear() && end.getFullYear() >= currentDate.toDate().getFullYear()) {
            value = bev.value / 365
          } else {
            value = 0
          }
          break;
        case 4:
          if (start <= currentDate.toDate() && end > currentDate.toDate()) {
            value = bev.value
          } else {
            value = 0
          }
          break;

      }
      //havi bontás
    } else {

      switch (bev.period.id) {
        case 0:

          if (start >= monthStart.toDate() && start <= monthEnd.toDate()) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 1:
          mstart = moment(start).clone().startOf('isoWeek');
          mend = moment(end).clone().endOf('isoWeek');
          dates = this.getDates(mstart.toDate(), mend.toDate(), 7)

          dates.forEach(item => {
            if (item >= monthStart.toDate() && item <= monthEnd.toDate()) {
              value += bev.value
            }
          })

          break;
        case 2:
          mstart = moment(start).clone().startOf('month');
          mend = moment(end).clone().endOf('month');
          if (mstart.toDate() <= monthStart.toDate() && mend.toDate() >= monthEnd.toDate()) {
            value = bev.value
          } else {
            value = 0
          }
          break;
        case 3:

          if (start.getFullYear() <= monthStart.toDate().getFullYear() && end.getFullYear() >= monthEnd.toDate().getFullYear()) {
            value = bev.value / 12
          }

          break;
        case 4:
          dates = this.getDates(start, end, 1)
          dates.forEach(item => {
            if (item >= monthStart.toDate() && item <= monthEnd.toDate()) {
              value += bev.value
            }
          })
          break;
      }
      this.selectedPeriod = PERIODS[2]
    }
    return value
  }

  // Összes bevétel, kiadás kiszámolása
  getAllBevetel() {
    if (this.bevetels != undefined) {
      this.bevetels.subscribe(x => {
        this.allBevetel = 0;
        x.forEach(item => {
          this.allBevetel += this.getHavi(item)
        })
      })
    }
  }

  getAllKiadas() {
    if (this.kiadasok != undefined) {
      this.kiadasok.subscribe(x => {
        this.allKiadas = 0;
        x.forEach(item => {

          this.allKiadas += this.getHavi(item)
        })
      })

    }
  }

  // függvény amivel megváltoztatjuk a periódikusságot
  async changeBontas() {

    this.selectedPeriod = this.bontasForm.value.period
    this.getAllKiadas()
    this.getAllBevetel()
    await this.getBevetel(this.myid);
    await this.getKiadasok(this.myid);
    this.sortKiads()
    this.sortBevs()
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.startdate.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.startdate.setValue(ctrlValue);
    this.update()
    datepicker.close();
  }

  setYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.startdate.value!;
    ctrlValue.year(normalizedMonthAndYear.year());
    this.startdate.setValue(ctrlValue);
    this.update()
    datepicker.close();
  }

  // kerekítő függvény
  round(num: number) {
    return Math.round(num)
  }

  // függvény amivel összehasonlítjuk az objektumokat
  compare(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }

  // adatbázissal kapcsolatos függvények, dialógusok

  // bevétel kiadás hozzáadásáért felelős függvény
  async addBevetel(): Promise<void> {
    this.bevetelForm.value.userId = this.myid
    this.crudservice.createBevetelCollection(this.bevetelForm.value).then(r => {
    });
    this.bevetelForm.setValue({
        name: '',
        type: '',
        period: '',
        value: '',
        userId: ''
      }
    )
  }

  async addKiadas(): Promise<void> {
    this.kiadasForm.value.userId = this.myid;
    this.crudservice.createKiadasCollection(this.kiadasForm.value).then(r => {

    });
    this.kiadasForm.setValue({
      name: '',
      type: '',
      period: '',
      value: '',
      userId: ''
    })
  }


  // bevételek kiadások lekérdezéséért felelős függvény
  async getBevetel(uid ?: string) {
    this.bevetels = await this.crudservice.getBevetel(uid);
    this.sortBevs()
  }

  //rendező függvények
  sortBevs() {
    if (this.bevetels != undefined)
      this.bevetels = this.bevetels.pipe(map((data) => {
        data.sort((a, b) => {
          return this.getHavi(a) < this.getHavi(b) ? 1 : -1;
        });
        return data;
      }))
  }

  sortKiads() {
    if (this.kiadasok != undefined)
      this.kiadasok = this.kiadasok.pipe(map((data) => {
        data.sort((a, b) => {
          return this.getHavi(a) < this.getHavi(b) ? 1 : -1;
        });
        return data;
      }))
  }


  async getKiadasok(uid ?: string) {
    this.kiadasok = await this.crudservice.getKiadas(uid);
    this.sortKiads()
  }

  // bevételek kiadások frissítéséért felelős függvény

  openUpdateBevDialog(name: string | undefined, type: BeveteliKategoria | undefined, period: Period | undefined, value: number | undefined, id: string | undefined, start: Timestamp | undefined, end: Timestamp | undefined): void {

    const dialogRef = this.dialog.open(BevetelUpdateComponent, {
      data: {
        name: name,
        type: type,
        period: period,
        value: value,
        id: id,
        userid: this.myid,
        start: start,
        end: end
      }

    })
    dialogRef.afterClosed().subscribe((bevetel: Bevetel) => {
      if (id != undefined) {
        if (bevetel?.name) {
          bevetel.userId = this.myid ? this.myid : "hiba"
          this.crudservice.createBevetelCollection(bevetel, id).then();
        }
      } else {
        bevetel.userId = this.myid ? this.myid : "hiba"
        this.crudservice.createBevetelCollection(bevetel).then();
      }
    }, err => {
      console.warn(err);
    });

  }

  openUpdateKiadDialog(name: string | undefined, type: KiadasiKategoria | undefined, period: Period | undefined, value: number | undefined, id: string | undefined, start: Timestamp | undefined, end: Timestamp | undefined): void {
    const dialogRef = this.dialog.open(KiadasUpdateComponent, {
      data: {
        name: name,
        type: type,
        period: period,
        value: value,
        id: id,
        userid: this.myid,
        start: start,
        end: end
      }
    })

    dialogRef.afterClosed().subscribe((kiadas: Kiadas) => {

      if (id != undefined) {
        if (kiadas?.name) {
          kiadas.userId = this.myid ? this.myid : "hiba"

          this.crudservice.createKiadasCollection(kiadas, id).then();
        }

      } else {
        kiadas.userId = this.myid ? this.myid : "hiba"
        this.crudservice.createKiadasCollection(kiadas).then();
      }
    }, err => {
      console.warn(err);
    });

  }

  // bevételek kiadások törléséért felelős függvény
  deleteKiadas(did: string): void {
    if (confirm("Biztosan szeretné törölni a kiválasztott elemet?")) {
      this.crudservice.deleteKiadas(did);
    }
    this.getBevetel()
  }

  deleteBevetel(did: string): void {
    if (confirm("Biztosan szeretné törölni a kiválasztott elemet?")) {
      this.crudservice.deleteBevetel(did);
    }
  }

}
