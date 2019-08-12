import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './authorization.routing';
import { ProgressbarModule } from 'ng2-bootstrap';
import { TabsModule } from 'ng2-bootstrap/tabs';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {ModalModule} from "angular2-modal/";
import { DropdownModule } from 'ng2-bootstrap';
import { TooltipModule } from 'ng2-bootstrap';
import { AccordionModule } from 'ng2-bootstrap';
import { ButtonsModule } from 'ng2-bootstrap';
import { AlertModule } from 'ng2-bootstrap';
import {SimpleNotificationsModule, PushNotificationsModule} from 'angular2-notifications';
import ALCommonsModule from "../common.module";
import { PopoverModule } from 'ng2-bootstrap';
import {InputTextModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import {SelectModule} from "ng2-select";
import {DataTableModule} from "angular2-datatable";
import { DropdownMultiselectModule } from 'ng2-dropdown-multiselect';
import {TreeModule,TreeNode} from 'primeng/primeng';
import {AuthorizationPage} from "./authorization.component";
import {NotificationCell} from "../../theme/airlock.components/notificationCell/notificationCell.component";
import {AddNotificationModal} from "../../theme/airlock.components/addNotificationModal/addNotificationModal.component";
import {EditNotificationModal} from "../../theme/airlock.components/editNotificationModal/editNotificationModal.component";
import {ReorderNotificationsModal} from "../../theme/airlock.components/reorderNotificationsModal/reorderNotificationsModal.component";
import {LimitNotificationsModal} from "../../theme/airlock.components/limitNotificationsModal/limitNotificationsModal.component";
import {AddUserModal} from "../../theme/airlock.components/addUserModal";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        Ng2Bs3ModalModule,
        PopoverModule.forRoot(),
        ProgressbarModule.forRoot(),
        DropdownModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        SimpleNotificationsModule,
        DropdownMultiselectModule,
        ALCommonsModule,
        PushNotificationsModule,
        routing,
        InputTextModule,
        ListboxModule,
        DataTableModule,
        TreeModule,
        SelectModule,

    ],
    declarations: [
        AuthorizationPage,
        AddUserModal
    ],
    providers: [
    ]
})
export default class AuthorizationModule {}
