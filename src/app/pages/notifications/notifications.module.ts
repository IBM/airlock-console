import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './notifications.routing';
import {NotificationsPage} from "./notifications.component";
import {NotificationCell} from "../../@theme/airlock.components/notificationCell/notificationCell.component";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import ALCommonsModule from "../common.module";
import {AddNotificationModal} from "../../@theme/modals/addNotificationModal";
import {
    NbButtonModule,
    NbCardModule,
    NbLayoutModule,
    NbPopoverModule,
    NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {EditNotificationModal} from "../../@theme/modals/editNotificationModal";
import {LimitNotificationsModal} from "../../@theme/modals/limitNotificationsModal";
import {ReorderNotificationsModal} from "../../@theme/modals/reorderNotificationsModal";

// import ALCommonsModule from "../common.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        TooltipModule.forRoot(),
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ALCommonsModule,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        routing,
    ],
    declarations: [
        NotificationsPage,
        NotificationCell,
        AddNotificationModal,
        EditNotificationModal,
        ReorderNotificationsModal,
        LimitNotificationsModal
    ],
    providers: [
        NbCardModule
    ]
})
export class NotificationsModule { }

