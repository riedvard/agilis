import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './shared/services/auth.guard';
import {HomeComponent} from './pages/home/home.component';
import {LoginComponent} from './pages/login/login.component';
import {SignupComponent} from './pages/signup/signup.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {IncomeComponent} from './pages/income/income.component';
import {ExpensesComponent} from './pages/expenses/expenses.component';
import {BudgetComponent} from './pages/budget/budget.component';
import {KiadstatsComponent} from "./pages/kiadstats/kiadstats.component";

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'stats', component: KiadstatsComponent},
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children: [], canActivateChild: [AuthGuard]
  },
  {path: 'income', component: IncomeComponent, canActivate: [AuthGuard], pathMatch: 'full'},
  {path: 'expenses', component: ExpensesComponent, canActivate: [AuthGuard], pathMatch: 'full'},
  {path: 'budget', component: BudgetComponent, canActivate: [AuthGuard], pathMatch: 'full'},
  {path: '**', component: HomeComponent},
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
