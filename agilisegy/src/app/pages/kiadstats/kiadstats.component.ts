import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Observable, of} from "rxjs";

import {KiadasiKategoria} from "../../shared/models/kiadasiKategoria.model";
import {Bevetel} from "../../shared/models/bevetel.model";
import {Kiadas} from "../../shared/models/kiadas.model";
import {Period} from "../../shared/models/period.model";

import {PERIODS} from "../../shared/database/period.database";

import {CrudService} from "../../shared/services/crud.service";
import * as moment from "moment";
import {Moment} from "moment";
import {MatDatepicker} from "@angular/material/datepicker";
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { PlotlyViaWindowModule } from 'angular-plotly.js';


PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-kiadstats',
  templateUrl: './kiadstats.component.html',
  styleUrls: ['./kiadstats.component.scss']
})

//kiadási statisztikákért felelős componens
export class KiadstatsComponent implements OnInit {
//dátumválasztó formcontrollok
  startdate = new FormControl('')

  //session
  myid ? = '';

  //adatbázisváltozók
  periods = PERIODS;
  kiadtypes: Observable<KiadasiKategoria[]> | undefined = of([]);
  bevetels: Observable<Bevetel[]> | undefined = of([]);
  kiadasok: Observable<Kiadas[]> | undefined = of([]);

  //összes bevétel kiadás
  allBevetel: number;
  allKiadas: number;

  //táblázatok tömbje
  tables: Kiadas[][];

  //megjelenítendő oszlopok
  columnsToDisplay = ['name', 'period', 'value', 'monthly'];

  //aktuális periódus
  selectedPeriod = PERIODS[1]

  //lehetséges értékek a periódusoknak
  bontasok: Period[];

  //periódusválasztó form
  bontasForm = new FormGroup(
    {
      period: new FormControl(''),
    });

  constructor(private afAuth: AngularFireAuth,
              private formBuilder: FormBuilder, private crudservice: CrudService) {
    this.allBevetel = 0
    this.allKiadas = 0
    this.tables = []
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


    this.kiadtypes = this.crudservice.getKiadasiKategoria(this.myid);

    await this.getAllBevetel()
    await this.getAllKiadas()

   await this.getAllTable()
    console.log("next? ")
console.log(this.tables[0][0])
    console.log(this.graph)
    await this.chart();

  }

  public graph : any ;
  public statistic : any;

  async chart(){
    await new Promise(f => setTimeout(f, 400));
   // this.graph.data = [1,2]
    let adatok : number[]
    adatok = []
    let labels : string[]
    labels = []
    this.tables.forEach(
      item => {
        adatok.push(this.totalCost(item))
        labels.push(item[0].type.name)
      }
    )


    this.graph = {
      data : [{
        text: labels,

        values: adatok,
        type: "pie",
        hole:.4,
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0,
          pad: 0
        },
      }],
      layout: {width: 500 , showlegend: false,
        automargin: true,
        paper_bgcolor: 'transparent'
        },


   };
    this.statistic = {
      data : [{
        text: ['Felhasznált', 'Megmaradt'],

        values: [this.allKiadas, this.allBevetel - this.allKiadas],
        type: "pie",
        hole:.4,
        marker: {
          colors: ['#d20606', '#3fa80a']
        },
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0,
          pad: 4
        },
      }],
      layout: {width: 500 , showlegend: false,
        automargin: true,
        paper_bgcolor: 'transparent'
      },


    };


  }

  //adatbázishoz kapcsolatos függvények
  //bevételek kiadások lekérdezése
  async getBevetel(uid?: string) {

    this.bevetels = this.crudservice.getBevetel(uid);

  }

  async getKiadasok(uid?: string) {
    this.kiadasok = this.crudservice.getKiadas(uid);
  }

  //megjelenítéshez szükséges függvények
  //egy táblázat összes kiadását kiszámoló függvény
  totalCost(tomb: Kiadas[]) {
    var sum = 0;
    for (const i in tomb) {
      sum += this.getHavi(tomb[i]);
    }
    return sum;
  }
  //kiadások táblázatokra bontó függvénye
  async getAllTable() {
    this.tables=[]
    if (this.kiadasok != undefined) {
      var i = 0
      var tablenames: String[]
      tablenames = []

      this.kiadasok.subscribe(x => {
        x.forEach(item => {
          if (!tablenames.includes(item.type.name)) {
            let tbl = x.filter(s => s.type.name == item.type.name)
            tbl.sort((a, b) => this.getHavi(b) - this.getHavi(a))
            this.tables.push(tbl)
            tablenames.push(item.type.name)

            i++
          }

        })
      })


    }
    await new Promise(f => setTimeout(f, 400));

  }

  //bevételek, kiadások kiszámolása
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

  // perióduscserélő metódus
  changeBontas() {

    this.selectedPeriod = this.bontasForm.value.period
    this.update()
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

  //bontások kiszámolásáért felelős metódus
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

  //százalékszámítás az összes kiadáshoz képest
  precentage(szam: number) {
    if (szam != 0) {
      var pre = szam / this.allKiadas
      return Math.round(pre * 100)
    } else {
      return 0
    }

  }

  //kerekítő függvény
  round(num: number) {
    return Math.round(num)
  }

  //objektum összehasonlító függvény
  compare(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }

  setCurrentDate() {
    this.startdate.setValue(moment().toDate())
  }

  update() {

    this.getAllBevetel()
    this.getAllKiadas()
    this.getAllTable()
    this.chart()
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


}
