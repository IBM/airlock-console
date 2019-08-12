import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './webhooks.routing';
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
import {WebhooksPage} from "./webhooks.component";
import {WebhookCell} from "../../theme/airlock.components/webhookCell/webhookCell.component";
import {AddWebhookModal} from "../../theme/airlock.components/addWebhookModal";
import {EditWebhookModal} from "../../theme/airlock.components/editWebhookModal";

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
        WebhooksPage,
        WebhookCell,
        AddWebhookModal,
        EditWebhookModal
    ],
    providers: [
    ]
})
export default class WebhooksModule {}
