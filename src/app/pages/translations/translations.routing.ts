/**
 * Created by elikkatz on 19/01/2017.
 */
import {RouterModule, Routes} from '@angular/router';
import {TranslationsPage} from "./translations.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: TranslationsPage,
        data: {
            menu: {
                title: 'Translations',
                icon: 'ion-cube',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
