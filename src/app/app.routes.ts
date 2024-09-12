import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {SupportComponent} from "./support/support.component";
import {TreeDataManagerComponent} from "./app/tree-data-manager/tree-data-manager.component";
import {FeatureComponent} from "./feature/feature.component";
import {SettingComponent} from "./setting/setting.component";

export const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'login', component: LoginComponent},
  {path: 'support', component: SupportComponent},
  {path: 'feature', component: FeatureComponent},
  {path: 'setting', component: SettingComponent},
  {path: 'app', component: TreeDataManagerComponent},

];
