/**
 * Created by elikkatz on 19/01/2017.
 */
import {RouterModule, Routes} from '@angular/router';
import {NotificationsPage} from "./notifications.component";
import {AuthGuard} from "../../services/auth-guard.service";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: NotificationsPage,
        data: {
            menu: {
                title: 'Notifications',
                icon: 'fa fa-bell',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
