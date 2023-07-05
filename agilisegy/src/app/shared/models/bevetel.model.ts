import {Period} from "./period.model";
import {KiadasiKategoria} from "./kiadasiKategoria.model";
import {BeveteliKategoria} from "./beveteliKategoria.model";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface Bevetel {
  id: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  type: BeveteliKategoria | KiadasiKategoria;
  period: Period;
  value: number;
  userId: string;
}
