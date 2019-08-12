import { Routes, RouterModule } from '@angular/router';
import {Administration} from "./administration.component";
import {Products} from "../products/products.component";
import {Groups} from "../groups/groups.component";
import {AuthGuard} from "../../services/auth-guard.service";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: Administration,
    children: [
      { path: 'products', component: Products },
      { path: 'groups', component: Groups },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
