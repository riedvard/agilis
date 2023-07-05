import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Observable, of} from "rxjs";

import {BeveteliKategoria} from "../../shared/models/beveteliKategoria.model";

import {CrudService} from "../../shared/services/crud.service";


@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})

//ez a komponens végzi a bevételi kategóriák kezelését
export class BudgetComponent implements OnInit {
  //session
  myid ? = '';

  //a felhasználóhoz kapcsolódó bevételi kategóriák
  beveteliKategoriak: Observable<BeveteliKategoria[]> | undefined = of([]);

  //form
  beveteliKategoriakForm = new FormGroup(
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
    await this.getBeveteliKategoria(this.myid);
  }

  //bevételi kategória hozzáadásához szükséges metódus
  async createBeveteliKategoria(): Promise<void> {
    this.beveteliKategoriakForm.value.userId = this.myid
    let variable = this.beveteliKategoriakForm.value.name;
    let keepGoing = true;

    this.beveteliKategoriak?.subscribe(
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

    console.log(keepGoing)
    if (keepGoing) {
      this.crudservice.createBeveteliKategoria(this.beveteliKategoriakForm.value).then(r => {
      });
    }
    else {
      alert("Ez a kategória már létezik!");
    }
    this.beveteliKategoriakForm.setValue({
      name: '',
      userId: ''
    })
  }

  //bevételi kategóriák listázásához szükséges metódus
  async getBeveteliKategoria(uid?: string) {
    this.beveteliKategoriak = this.crudservice.getBeveteliKategoria(uid);
  }

  //bevételi kategóriák törléséhez szükséges metódus
  deleteBeveteliKategoria(id: string) {
    if (confirm("Biztosan szeretné törölni a kiválasztott elemet?")) {
      this.crudservice.deleteBeveteliKategoria(id).then();
    }
  }
}
