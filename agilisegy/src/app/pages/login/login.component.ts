import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {FacebookAuthProvider, getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {addDoc, collection, collectionData, deleteDoc, doc, Firestore} from '@angular/fire/firestore';
import {Observable, of} from 'rxjs';

import {AuthService} from '../../shared/services/auth.service'

const provider_google = new GoogleAuthProvider();
const provider_facebook = new FacebookAuthProvider();

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

//componens ami a bejelentkezésért felel
export class LoginComponent implements OnInit {

  //form
  loginForm: FormGroup;

  //hibajelző string
  firebaseErrorMessage: string;

  //holderek
  TestHolder: any[] = [];

  getHolder: Observable<any[]> = of([]);

  constructor(public authService: AuthService,
              private router: Router,
              private afAuth: AngularFireAuth,
              private firestore: Firestore
  ) {
    this.loginForm = new FormGroup({
      'email': new FormControl('', [Validators.required]),
      'password': new FormControl('', Validators.required)
    });

    this.firebaseErrorMessage = '';
  }

  ngOnInit(): void {

  }

  //bejelentkező függvény
  loginUser() {

    if (!ValidateEmail(this.loginForm.value.email)) {

      return;
    }
    this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password).then((result) => {
      // debugger

      if (result) {
        if (this.authService.userLoggedIn) {
          this.router.navigate(['/dashboard']);
        }
      }


      if (!result) {
        alert("Email cím vagy a jelszó nem megfelelő!");

        this.firebaseErrorMessage = "nem megfelelő email cím vagy jelszó";

      }
    });
  }

  //gmail bejelentkező függvény
  loginWithGmail() {
    const auth = getAuth();
    signInWithPopup(auth, provider_google)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
        }
        // The signed-in user info.
        const user = result.user;
        // ...
        this.router.navigate(['/dashboard']);
      }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });

  }

  //facebook bejelentkező függvény
  facebookLogin() {
    const auth = getAuth();
    signInWithPopup(auth, provider_facebook)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        if (credential) {
          const accessToken = credential.accessToken;
        }
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);
      });

  }

  //ha feltöltöd az email-jelszót bármivel, még ha hibás is, ha megnyomod az add-ot, akkor feltölti az adatbázisba
  //ide megy paraméterben az elem, amit addolni szerentél, pl "var asd:any = {"three":3, "five":5};"
  async addExample() {
    var asd: any = {"firstname": this.loginForm.value.email, "lastname": this.loginForm.value.password};
    const ref = collection(this.firestore, 'Test');
    return await addDoc(ref, asd).then(x => {
      // this.TestHolder = asd
      console.log("Data pushed -- no feedback");
    });
  }

  //majd az adott id-t kell megadni neki onclikc ngfor-nál pl: (click)=remove(element.id)
  //ezzel tudsz adatot kitörölni, ide megy az elem id-ja a collectionból, pl: "4r6AqyodLi1H2iF7SU4b"
  async removeExample(id: number) {
    const ref = doc(this.firestore, `Test/${id}`);
    return await deleteDoc(ref).then(x => {
      console.log("Data removed -- no feedback");
    });
  }

  //le lehet kérni az összes elemét egy adott listának, sajnos itt még async problémák vannak..
  async getExample() {
    const ref = collection(this.firestore, 'Test');
    var retHolder: any[] = [];
    this.getHolder = await collectionData(ref);
    this.getHolder.forEach(y => {
      y.forEach(x => {
        retHolder.push(x);
      });
      this.TestHolder = retHolder;
    });
    return;
  }
}

//emailvalidációs függvény
function ValidateEmail(input: string) {
  var validRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!input.match(validRegex)) {
    alert("Invalid email address!");
    return false;
  }
  return true;
}
