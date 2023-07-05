import {Component, OnInit} from '@angular/core';
import {collection, collectionData, Firestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {delay, Observable, of} from 'rxjs';
import {DocumentData} from 'rxfire/firestore/interfaces';

import {AuthService} from '../../shared/services/auth.service'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})

//regisztrációs componens
export class SignupComponent implements OnInit {
  // regisztréciós form
  signupForm!: FormGroup;

  //hibaüzenet
  firebaseErrorMessage: string;

  constructor(private authService: AuthService,
              private router: Router,
              private afAuth: AngularFireAuth,
              private firestore: Firestore) {
    this.firebaseErrorMessage = '';
  }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      'displayName': new FormControl('', Validators.required),
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', Validators.required)
    });
  }

  //regisztrációs függvény
  async signup() {
    if (await this.checkIfEmailAlreadyExists(this.signupForm.value.email)) {
      //biztos, ami biztos..
      this.firebaseErrorMessage = "A megadott email cím már foglalt!"
      return;
    }
    if (!ValidateEmail(this.signupForm.value.email)) return;
    if (!isValidName(this.signupForm.value.displayName)) return;
    if (!ValidatePassword(this.signupForm.value.password)) return;
    this.authService.signupUser(this.signupForm.value).then((result) => {
      if (result == null)
        this.router.navigate(['/dashboard']);
      else if (result.isValid == false)
        this.firebaseErrorMessage = result.message;

      if ("Firebase: The email address is already in use by another account. (auth/email-already-in-use)." == this.firebaseErrorMessage) {
        this.firebaseErrorMessage = "A megadott email cím már foglalt!";
      }
    }).catch(() => {

    });

  }

  //email használt e már ellenőrző függvény
  async checkIfEmailAlreadyExists(em: string): Promise<boolean> {
    const ref = collection(this.firestore, 'users');
    var retval = 0;
    var retHolder: Observable<DocumentData> = of([]);
    retHolder = await collectionData(ref);
    delay(200) //pls senki se flameljen köxi
    retHolder.forEach(y => {
      if (Reflect.get(y, '1').email == em) {
        retval++;
      }
    });

    if (retval == 0) {
      return false;
    }
    return true;
  }
}

//valid email ellenőrző
function ValidateEmail(input: string) {
  var validRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!input.match(validRegex)) {
    alert("Nem megfelelő email formátum");
    return false;
  }
  return true;
}

//valid név ellenőrző
function isValidName(input: string) {
  var validCharactersRegex = /^([A-ZÁÉÚŐÓÜÖÍ]([a-záéúőóüöí.]+\s?)){2,}$/;
  if (!input.match(validCharactersRegex)) {
    alert("Nem megfelelő név");
    return false;
  }
  return true;
}

//valid jelszó ellenőrző
function ValidatePassword(input: string) {
  var validRegexPw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  if (!input.match(validRegexPw)) {
    alert("Legalább 6 karakter legyen, 1 nagybetűt, 1 kisbetűt és 1 számot tartalmazzon!");
    return false;
  }
  return true;
}

