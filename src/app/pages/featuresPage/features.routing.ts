/**
 * Created by elikkatz on 19/01/2017.
 */
import { Routes, RouterModule }  from '@angular/router';
import {FeaturesPage} from "./featuresPage.component";
import {AuthGuard} from "../../services/auth-guard.service";


// noinspection TypeScriptValidateTypes
const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: FeaturesPage,
        data: {
            menu: {
                title: 'Features',
                icon: 'ion-cube',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];

export const routing = RouterModule.forChild(routes);
