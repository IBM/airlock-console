/**
 * Created by elikkatz on 19/01/2017.
 */
import { Routes, RouterModule }  from '@angular/router';
import {PurchasesPage} from "./purchases.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: PurchasesPage,
        data: {
            menu: {
                title: 'Premium',
                icon: 'ion-erlenmeyer-flask',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
