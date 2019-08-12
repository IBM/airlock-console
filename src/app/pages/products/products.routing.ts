import { Routes, RouterModule }  from '@angular/router';

import {AuthGuard} from "../../services/auth-guard.service";
import {Products} from "./products.component";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: Products,
    data: {
      menu: {
        title: 'Products',
        icon: 'ion-android-phone-portrait',
        selected: false,
        expanded: false,
        order: 100
      }
    }
  }
];

export const routing = RouterModule.forChild(routes);
