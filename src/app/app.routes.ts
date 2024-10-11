import { Routes } from '@angular/router';
import {HomeComponent} from "./_components/home/home.component";
import {LoginComponent} from "./_components/login/login.component";
import {SupportComponent} from "./_components/support/support.component";
import {TreeDataManagerComponent} from "./_components/tree-data-manager/tree-data-manager.component";
import {authGuard} from "./_guard/auth.guard";
import {FeatureComponent} from "./_components/feature/feature.component";
import {SettingComponent} from "./_components/setting/setting.component";

export const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'login', component: LoginComponent},
  {path: 'support', component: SupportComponent},
  {path: 'feature', component: FeatureComponent},
  {path: 'setting', component: SettingComponent},
  {path: 'app', component: TreeDataManagerComponent},
  {path: 'app/:preselect', component: TreeDataManagerComponent},
// Due to time constraints, the code activated by this route
// could not be adequately tested. It has been deactivatd via
// comment, and the code has been left in place.
/*
  {
    path: 'fileManagement',
    component: FileManagementComponent,
    canActivate: [authGuard],
    children: [{
      path:'',
      redirectTo: 'upload',
      pathMatch: 'full'
    },{
      path: "upload",
      component: FileUploadComponent
    }],
  }
*/
];
