/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import ALCommonsModule from "../common.module";
import {routing} from './cohorts.routing';
import {CohortsPage} from "./cohorts.component";
import {CohortCell} from "../../@theme/airlock.components/cohortCell";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {TransparentSpinner} from "../../@theme/airlock.components/transparentSpinner";
import {AddCohortModal} from "../../@theme/modals/addCohortModal";
import {
    NbButtonModule,
    NbCardModule,
    NbLayoutModule,
    NbPopoverModule,
    NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {EditCohortModal} from "../../@theme/modals/editCohortModal";
import {ReorderCohortsModal} from "../../@theme/modals/reorderCohortsModal";
import {RenameCohortExportModal} from "../../@theme/modals/renameCohortExportModal";

// import {DataTableModule, InputTextModule, ListboxModule, TreeModule} from 'primeng/primeng';
// import {SelectModule} from "ng2-select";
// import {DropdownMultiselectModule} from 'ng2-dropdown-multiselect';
// import {ReorderCohortsModal} from "../../theme/airlock.components/reorderCohortsModal";
// import {RenameCohortExportModal} from "../../theme/airlock.components/renameCohortExportModal";
// import {MultiselectDropdownModule} from "angular-2-dropdown-multiselect/index";

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
        // MultiselectDropdownModule,
        ALCommonsModule,
        routing,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        // InputTex
        // tModule,
        // ListboxModule,
        // DataTableModule,
        // TreeModule,
        // SelectModule,

    ],
    declarations: [
        CohortsPage,
        CohortCell,
        AddCohortModal,
        EditCohortModal,
        ReorderCohortsModal,
        RenameCohortExportModal
    ]
})
export class CohortsModule {}
