import { Routes } from '@angular/router';
import {HomeComponent} from "./_components/home/home.component";
import {LoginComponent} from "./_components/login/login.component";
import {SupportComponent} from "./_components/support/support.component";
import {TreeDataManagerComponent} from "./_components/tree-data-manager/tree-data-manager.component";
import {authGuard} from "./_guard/auth.guard";

export const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'login', component: LoginComponent},
  {path: 'support', component: SupportComponent},
  {path: 'app', component: TreeDataManagerComponent},
  {path: 'app/:preselect', component: TreeDataManagerComponent},
];
