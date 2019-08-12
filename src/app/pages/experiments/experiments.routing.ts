/**
 * Created by elikkatz on 19/01/2017.
 */
import { Routes, RouterModule }  from '@angular/router';
import {ExperimentsPage} from "./experiments.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: ExperimentsPage,
        data: {
            menu: {
                title: 'Experiments',
                icon: 'ion-erlenmeyer-flask',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
