/**
 * Created by elikkatz on 19/01/2017.
 */
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './streams.routing';
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
import {DataTableModule,SharedModule} from 'primeng/primeng';
import {SelectModule} from "ng2-select";

import { DropdownMultiselectModule } from 'ng2-dropdown-multiselect';
import {TreeModule,TreeNode} from 'primeng/primeng';
import {StreamsPage} from "./streams.component";
import {AddStreamModal} from "../../theme/airlock.components/addStreamModal/addStreamModal.component";
import {StreamCell} from "../../theme/airlock.components/streamCell/streamCell.component";
import {FlaskIcon} from "../../theme/airlock.components/flaskIcon/flaskIcon.component";
import {EditStreamModal} from "../../theme/airlock.components/editStreamModal/editStreamModal.component";

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
        PushNotificationsModule,ALCommonsModule,
        routing,
        InputTextModule,
        ListboxModule,
        DataTableModule,
        TreeModule,
        SelectModule,

    ],
    declarations: [
        StreamsPage,AddStreamModal,EditStreamModal,
        StreamCell
    ],
    providers: [
    ]
})
export default class StreamsModule {}
