import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './webhooks.routing';
import ALCommonsModule from "../common.module";
import {WebhooksPage} from "./webhooks.component";
import {WebhookCell} from "../../@theme/airlock.components/webhookCell/webhookCell.component";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {AddWebhookModal} from "../../@theme/modals/addWebhookModal";
import {NbCardModule, NbPopoverModule, NbSelectModule, NbTabsetModule} from "@nebular/theme";
import {EditWebhookModal} from "../../@theme/modals/editWebhookModal";

//Modal views
// import {EditWebhookModal} from "../../theme/airlock.components/editWebhookModal";
// import {DropdownMultiselectModule} from 'ng2-dropdown-multiselect';
// import {DataTableModule} from "angular2-datatable";
// import {SelectModule} from "ng2-select";
// import {InputTextModule, ListboxModule, TreeModule} from 'primeng/primeng';
// import {PushNotificationsModule, SimpleNotificationsModule} from 'angular2-notifications';
// import {ModalModule} from "angular2-modal/";
// import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        NbPopoverModule,
        PopoverModule.forRoot(),
        ProgressbarModule.forRoot(),
        TooltipModule.forRoot(),
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        ALCommonsModule,
        routing,
        NbSelectModule,
        // InputTextModule,
        // ListboxModule,
        // DataTableModule,
        // TreeModule,
        // SelectModule,
    ],
    declarations: [
        WebhooksPage,
        WebhookCell,
        AddWebhookModal,
        EditWebhookModal
    ],
    providers: []
})
export class WebhooksModule {
}
