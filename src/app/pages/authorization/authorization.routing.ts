/**
 * Created by elikkatz on 19/01/2017.
 */
import { Routes, RouterModule }  from '@angular/router';
import {AuthorizationPage} from "./authorization.component";
import {AuthGuard} from "../../services/auth-guard.service";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: AuthorizationPage,
        data: {
            menu: {
                title: 'Users',
                icon: 'fa fa-user-circle',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
