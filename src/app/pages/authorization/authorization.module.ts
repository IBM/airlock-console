import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routing }       from './authorization.routing';

import ALCommonsModule from "../common.module";
import {AuthorizationPage} from "./authorization.component";
import {NgaModule} from "../../@theme/nga.module";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {PopoverModule} from "ngx-bootstrap/popover";
import {TabsModule} from "ngx-bootstrap/tabs";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {AddUserModal} from "../../@theme/modals/addUserModal";
import {NbCardModule, NbPopoverModule, NbSelectModule, NbTabsetModule} from "@nebular/theme";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {Ng2SmartTableModule} from "ng2-smart-table";
import {CustomCheckboxComponent} from "./custom.checkbox.component";
import {CustomDeleteComponent} from "./custom.delete.component";

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
        Ng2SmartTableModule,
    ],
    declarations: [
        AuthorizationPage,
        AddUserModal,
        CustomCheckboxComponent,
        CustomDeleteComponent
    ],
    providers: [
    ]
})
export class AuthorizationModule {}
