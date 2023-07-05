import {Period} from "./period.model";
import {KiadasiKategoria} from "./kiadasiKategoria.model";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface Kiadas {
  id: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  type: KiadasiKategoria;
  period: Period;
  value: number;
  userId: string;
}
