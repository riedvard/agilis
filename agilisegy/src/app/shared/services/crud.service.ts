import {Injectable} from '@angular/core';
import {AngularFireList} from "@angular/fire/compat/database";
import {Bevetel} from '../models/bevetel.model';
import {AngularFirestore, CollectionReference, Query} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {Kiadas} from "../models/kiadas.model";
import {KiadasiKategoria} from "../models/kiadasiKategoria.model";

import {BeveteliKategoria} from "../models/beveteliKategoria.model";

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  studentsRef: AngularFireList<any> | undefined;

  constructor(public firestoreservices: AngularFirestore) {
  }

  async createBevetelCollection(newData: Bevetel, id?: string): Promise<any> {
    const uid = id ? id : this.firestoreservices.createId();
    newData.id = uid;
    await this.firestoreservices.collection('Bevetel').doc(uid).set(newData);
    return uid;
  }

  async createKiadasCollection(newData: Kiadas, id?: string): Promise<any> {
    const uid = id ? id : this.firestoreservices.createId();
    newData.id = uid;
    await this.firestoreservices.collection('Kiadas').doc(uid).set(newData);
    return uid;
  }

  async createKiadasiKategoria(newData: KiadasiKategoria, id?: string) {
    const uid = id ? id : this.firestoreservices.createId();
    newData.id = uid;
    await this.firestoreservices.collection('KiadasiKategoria').doc(uid).set(newData);
    return uid;
  }

  async createBeveteliKategoria(newData: BeveteliKategoria, id?: string) {
    const uid = id ? id : this.firestoreservices.createId();
    newData.id = uid;
    await this.firestoreservices.collection('BeveteliKategoria').doc(uid).set(newData);
    return uid;
  }


  getBevetel(uid?: string): Observable<Bevetel[]> {
    return this.firestoreservices.collection('Bevetel', ref => {
      let query: CollectionReference | Query = ref;

      query = query.where("userId", "==", uid);

      return query;
    }).valueChanges() as Observable<Bevetel[]>;

  }


  getKiadas(uid?: string): Observable<Kiadas[]> {
    return this.firestoreservices.collection('Kiadas', ref => {
      let query: CollectionReference | Query = ref;
      query = query.where("userId", "==", uid);
      return query;
    }).valueChanges() as Observable<Kiadas[]>;
  }

  getKiadasiKategoria(uid?: string): Observable<KiadasiKategoria[]> {
    return this.firestoreservices.collection('KiadasiKategoria', ref => {
      let query: CollectionReference | Query = ref;
      query = query.where("userId", "==", uid);
      return query;
    }).valueChanges() as Observable<KiadasiKategoria[]>;

  }

  getBeveteliKategoria(uid?: string): Observable<BeveteliKategoria[]> {
    return this.firestoreservices.collection('BeveteliKategoria', ref => {
      let query: CollectionReference | Query = ref;
      query = query.where("userId", "==", uid);
      return query;
    }).valueChanges() as Observable<BeveteliKategoria[]>;

  }

  deleteKiadasiKategoria(id: string): Promise<void> {
    return this.firestoreservices.collection('KiadasiKategoria').doc(id).delete();
  }

  deleteBeveteliKategoria(id: string): Promise<void> {
    return this.firestoreservices.collection('BeveteliKategoria').doc(id).delete();
  }

  deleteKiadas(id: string): Promise<void> {
    return this.firestoreservices.collection('Kiadas').doc(id).delete();
  }

  deleteBevetel(id: string): Promise<void> {
    return this.firestoreservices.collection('Bevetel').doc(id).delete();
  }


}
