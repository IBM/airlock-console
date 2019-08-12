/**
 * Created by elikkatz on 19/01/2017.
 */
import { Routes, RouterModule }  from '@angular/router';
import {WebhooksPage} from "./webhooks.component";
import {AuthGuard} from "../../services/auth-guard.service";


const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: WebhooksPage,
        data: {
            menu: {
                title: 'Webhooks',
                icon: 'fa fa-plug',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
