import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';

import {AuthService} from '../../shared/services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})

// a navbar componens minden oldal felett
export class NavComponent implements OnInit {

  // session
  static isLoggedIn?: boolean = localStorage.getItem('isLoggedIn') == "True";
  username?: string;

  constructor(public afAuth: AngularFireAuth, private router: Router, private authService: AuthService) {
    authService.userLoggedIn;
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.scroll, true)
    this.authService.userLoggedIn;
    this.getDetails()
  }

  //függvény ami lekérdezi hogy be vagyunk e jelentkezve
  async getDetails() {
    var getName: any = await this.afAuth.currentUser.then(x => {
      console.log(x?.displayName, x?.uid);
    });
    !!getName ? this.username = getName : this.username = "User";
  }

  //függvény, ami leelenőrzi hogy be vagyunk e jelentkezve
  checkIfLoggedIn(): boolean {
    return this.authService.userLoggedIn;
  }

  //kijelentkező függvény
  logout(): void {
    this.afAuth.signOut();

  }

  //legördülő animáció
  scroll = (): void => {

    let scrollHeigth;

    if (window.innerWidth < 350) {
      scrollHeigth = 150;
    } else if (window.innerWidth < 500 && window.innerWidth > 350) {
      scrollHeigth = 250;
    } else if (window.innerWidth < 700 && window.innerWidth > 500) {
      scrollHeigth = 350;
    } else if (window.innerWidth < 1000 && window.innerWidth > 700) {
      scrollHeigth = 500;
    } else {
      scrollHeigth = 650;
    }


    if (window.scrollY >= scrollHeigth) {
      document.body.style.setProperty('--navbar-scroll', "magenta");
      document.body.style.setProperty('--navbar-scroll-text', "black");
      document.body.style.setProperty('--navbar-scroll-shadow', "0px 6px 12px -5px #000000");
    } else if (window.scrollY < scrollHeigth) {
      document.body.style.setProperty('--navbar-scroll', "transparent");
      document.body.style.setProperty('--navbar-scroll-text', "white");
      document.body.style.setProperty('--navbar-scroll-shadow', "none");
    }
  }
}
