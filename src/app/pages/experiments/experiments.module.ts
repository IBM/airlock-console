/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './experiments.routing';
import {ExperimentsPage} from "./experiments.component";
import ALCommonsModule from "../common.module";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "@swimlane/ngx-charts";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {ExperimentCell} from "../../@theme/experimentCell";
import {VariantCell} from "../../@theme/airlock.components/variantCell";
import {FlaskIcon} from "../../@theme/flaskIcon";
import {AddBranchModal} from "../../@theme/modals/addBranchModal";
import {AddExperimentModal} from "../../@theme/modals/addExperimentModal";
import {AddVariantModal} from "../../@theme/modals/addVariantModal";
import {
    NbButtonModule,
    NbCardModule,
    NbLayoutModule,
    NbPopoverModule,
    NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {EditExperimentModal} from "../../@theme/modals/editExperimentModal";
import {EditVariantModal} from "../../@theme/modals/editVariantModal";
import {ReorderVariantsModal} from "../../@theme/modals/reorderVariantsModal";
import {ReorderExperimentsModal} from "../../@theme/modals/reorderExperimentsModal";
import {AceEditorModule} from "ngx-ace-editor-wrapper";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        TooltipModule,
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        ALCommonsModule,
        routing,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        AceEditorModule,
        ALCommonsModule,
        ALCommonsModule,
    ],
    declarations: [
        ExperimentsPage,
        ExperimentCell,
        AddBranchModal,
        AddExperimentModal,
        EditVariantModal,
        AddVariantModal,
        EditExperimentModal,
        VariantCell,
        FlaskIcon,
        ReorderExperimentsModal,
        ReorderVariantsModal,
        // ShowDashboardModal
    ],
})
export class ExperimentsModule {}
