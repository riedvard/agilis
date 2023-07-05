import {NgModule, ViewChild} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {HomeComponent} from './pages/home/home.component';
import {SignupComponent} from './pages/signup/signup.component';
import {LoginComponent} from './pages/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';

import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '../environments/environment';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {NavComponent} from './pages/nav/nav.component';
import {IncomeComponent} from './pages/income/income.component';
import {MatIconModule} from "@angular/material/icon";

import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';

import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {CrudService} from "./shared/services/crud.service";
import {AuthService} from "./shared/services/auth.service";
import {ExpensesComponent} from "./pages/expenses/expenses.component";
import {KiadstatsComponent} from './pages/kiadstats/kiadstats.component';
import {MatTableModule} from "@angular/material/table";
import {BudgetComponent} from "./pages/budget/budget.component";
import {BevetelUpdateComponent} from './pages/bevetel-update/bevetel-update.component';
import {MatDialogModule} from "@angular/material/dialog";
import {KiadasUpdateComponent} from './pages/kiadas-update/kiadas-update.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {DatePickerFormatDirective} from "./shared/Directives/date-picker-format.directive";
import {PlotlyModule} from "angular-plotly.js";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignupComponent,
    LoginComponent,
    IncomeComponent,
    DashboardComponent,
    NavComponent,
    ExpensesComponent,
    BudgetComponent,
    KiadstatsComponent,
    BevetelUpdateComponent,
    KiadasUpdateComponent,
    DatePickerFormatDirective
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase),
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        AngularFirestoreModule,
        provideFirestore(() => getFirestore()),
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTableModule,
        MatDialogModule,
        MatDatepickerModule,
        MatMomentDateModule,
      PlotlyModule,
      CommonModule
    ],
  providers: [AuthService, CrudService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
