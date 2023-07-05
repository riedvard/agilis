import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Observable, of} from "rxjs";

import {KiadasiKategoria} from "../../shared/models/kiadasiKategoria.model";

import {CrudService} from "../../shared/services/crud.service";

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})

//ez a komponens végzi a kiadási kategóriák kezelését
export class ExpensesComponent implements OnInit {
  //session
  myid ? = '';

  //a személyhez tartozó kiadási kategóriáit tároló változó
  kiadasiKategoriak: Observable<KiadasiKategoria[]> | undefined = of([]);

  //kiadási kategória hozzáadás form
  kiadasiKategoriakForm = new FormGroup(
    {
      name: new FormControl(''),
      userId: new FormControl('')
    });


  constructor(private afAuth: AngularFireAuth,
              private formBuilder: FormBuilder, private crudservice: CrudService) {

  }

  async ngOnInit() {
    await this.afAuth.currentUser.then(x => {
      this.myid = x?.uid;
    });
    await this.getKiadasiKategoria(this.myid);
  }

  //kiadási kategória hozzáadásához szükséges metódus
  async createKiadasiKategoria(): Promise<void> {

    this.kiadasiKategoriakForm.value.userId = this.myid;
    let variable = this.kiadasiKategoriakForm.value.name;
    let keepGoing = true;
    this.kiadasiKategoriak?.subscribe(
      vari => {
        vari.forEach(
          element => {
            if (keepGoing) {
              if (element.name === variable) {
                keepGoing = false;
              }
            }
          }
        )
      }
    )
    await new Promise(f => setTimeout(f, 200));


    if (keepGoing) {
      this.crudservice.createKiadasiKategoria(this.kiadasiKategoriakForm.value).then(r => {
      });
    }
    else {
      alert("Ez a kategória már létezik!");
    }

    this.kiadasiKategoriakForm.setValue({
      name: '',
      userId: ''
    })
  }

  //kiadási kategóriák listázásához szükséges metódus
  async getKiadasiKategoria(uid?: string) {
    this.kiadasiKategoriak = this.crudservice.getKiadasiKategoria(uid);
  }

  //kiadási kategóriák törléséhez szükséges metódus
  deleteKiadasiKategoria(id: string) {
    if (confirm("Biztosan szeretné törölni a kiválasztott elemet?")) {
      this.crudservice.deleteKiadasiKategoria(id).then();
    }
  }
}

