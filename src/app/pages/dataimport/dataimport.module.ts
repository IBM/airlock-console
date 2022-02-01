/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './dataimport.routing';
import ALCommonsModule from "../common.module";
import {DataimportPage} from "./dataimport.component";
import {DataimportCell} from "../../@theme/airlock.components/dataimportCell";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {TransparentSpinner} from "../../@theme/airlock.components/transparentSpinner";
import {AddDataimportModal} from "../../@theme/modals/addDataimportModal";
import {
    NbButtonModule,
    NbCardModule,
    NbLayoutModule,
    NbPopoverModule,
    NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {EditDataimportModal} from "../../@theme/modals/editDataimportModal";


//Modal views
// import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
// import {ModalModule} from "angular2-modal/";
// import {SelectModule} from "ng2-select";
// import {DropdownMultiselectModule} from 'ng2-dropdown-multiselect';
// import {AddDataimportModal} from "../../theme/airlock.components/addDataimportModal";
// import {EditDataimportModal} from "../../theme/airlock.components/editDataimportModal";
// import {DataTableModule, InputTextModule, ListboxModule, TreeModule} from 'primeng/primeng';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        // DropdownModule.forRoot(),
        TooltipModule.forRoot(),
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        // DropdownMultiselectModule,
        ALCommonsModule,
        routing,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        // InputTextModule,
        // ListboxModule,
        // DataTableModule,
        // TreeModule,
        // SelectModule,
    ],
    declarations: [
        DataimportPage,
        DataimportCell,
        AddDataimportModal,
        EditDataimportModal
    ]
})
export class DataimportModule {}
