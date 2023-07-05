import {Injectable} from '@angular/core';

import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userLoggedIn: boolean;

  constructor(private router: Router, private afAuth: AngularFireAuth) {
    this.userLoggedIn = false;

    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.userLoggedIn = true;
      } else {
        this.userLoggedIn = false;
      }
    });
  }


  loginUser(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Auth Service: loginUser: success');
        // this.router.navigate(['/dashboard']);
        return true;
      })
      .catch(error => {
        console.log('Auth Service: login error...');
        return false;
      });
  }

  async signupUser(user: any): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);
      // let emailLower = user.email.toLowerCase();
      if (result.user)
        result.user.sendEmailVerification();
    } catch (error: any) {
      return {isValid: false, message: error.message};
    }
  }


//   authenticated(): boolean {
//     return this.afAuth.authState !== null;
//   }

//   currentUserObservable(): any {
//     return this.afAuth.authState;
//   }
}
