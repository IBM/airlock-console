/**
 * Created by elikkatz on 19/01/2017.
 */
import {RouterModule, Routes} from '@angular/router';
import {StreamsPage} from "./streams.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: StreamsPage,
        data: {
            menu: {
                title: 'Streaming Analytics',
                icon: 'fa fa-crosshairs',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
