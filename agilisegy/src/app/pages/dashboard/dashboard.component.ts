import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AuthService} from '../../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  username: string = "";

  constructor(public afAuth: AngularFireAuth, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.getDetails();
  }


  async getDetails() {
    var getName: any = await this.afAuth.currentUser.then(x => {
      console.log(x?.displayName);
    });
    !!getName ? this.username = getName : this.username = "User";
    console.log(this.username)
  }
}
