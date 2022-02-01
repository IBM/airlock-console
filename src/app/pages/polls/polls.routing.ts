/**
 * Created by elikkatz on 19/01/2017.
 */
import {RouterModule, Routes} from '@angular/router';
import {PollsPage} from "./polls.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: PollsPage,
        data: {
            menu: {
                title: 'Polls',
                icon: 'fa-poll-h',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
