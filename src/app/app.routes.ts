import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {SupportComponent} from "./support/support.component";
import {TreeDataManagerComponent} from "./app/tree-data-manager/tree-data-manager.component";

export const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'login', component: LoginComponent},
  {path: 'support', component: SupportComponent},
  {path: 'app', component: TreeDataManagerComponent}
];
