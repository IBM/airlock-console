/**
 * Created by elikkatz on 19/01/2017.
 */
import {RouterModule, Routes} from '@angular/router';
import {DataimportPage} from "./dataimport.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: DataimportPage,
        data: {
            menu: {
                title: 'Data import',
                icon: 'fa fa-upload',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
