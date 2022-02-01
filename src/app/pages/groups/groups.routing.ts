import {RouterModule, Routes} from '@angular/router';
import {Groups} from "./groups.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: Groups,
        data: {
            menu: {
                title: 'User Groups',
                icon: 'ion-ios-people',
                selected: false,
                expanded: false,
                order: 200
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
