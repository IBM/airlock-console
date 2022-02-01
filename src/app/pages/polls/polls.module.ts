/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './polls.routing';
import {PollsPage} from "./polls.component";
import ALCommonsModule from "../common.module";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "@swimlane/ngx-charts";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {
    NbButtonModule,
    NbCardModule, NbDatepickerModule, NbInputModule,
    NbLayoutModule,
    NbPopoverModule, NbProgressBarModule, NbSelectModule,
    NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";

import {AceEditorModule} from "ngx-ace-editor-wrapper";
import {AddPollModal} from "../../@theme/modals/addPollModal";
import {EditPollModal} from "../../@theme/airlock.components/editPollModal";
import {PollCell} from "../../@theme/airlock.components/pollCell";
import {EditQuestionModal} from "../../@theme/modals/editQuestionModal";
import {AddQuestionModal} from "../../@theme/modals/addQuestionModal";
import {QuestionCell} from "../../@theme/airlock.components/questionCell";
import {PollOverview} from "../../@theme/airlock.components/pollOverview";
import {AnswerNode} from "../../@theme/airlock.components/answerNode";
import {ReorderQuestionsModal} from "../../@theme/modals/reorderQuestionsModal";
import {AnswerCell} from "../../@theme/airlock.components/answerCell";
import {ReorderAnswersModal} from "../../@theme/modals/reorderAnswersModal";
import {EditAnswerModal} from "../../@theme/modals/editAnswerModal";
import {AddAnswerModal} from "../../@theme/modals/addAnswerModal";
import {ImportPollsModal} from "../../@theme/modals/importPollsModal";
import {OpenAnswerCell} from "../../@theme/airlock.components/openAnswerCell";
import {EditOpenAnswerModal} from "../../@theme/modals/editOpenAnswerModal/editOpenAnswerModal.component";
import {AddOpenAnswerModal} from "../../@theme/modals/addOpenAnswerModal";
import {AirlockTooltip} from "../../@theme/airlock.components/airlockTooltip/airlockTooltip.component";
import {LimitPollsModal} from "../../@theme/modals/limitPollsModal";
import {PollsCalendarViewModal} from "../../@theme/airlock.components/pollCalendarViewModal";
import {FullCalendarModule} from "@fullcalendar/angular";
import {NbDateFnsDateModule} from "@nebular/date-fns";
import {NbMomentDateModule} from "@nebular/moment";
import {DateTimePickerModule} from "ngx-datetime-picker";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        NbDateFnsDateModule.forRoot({
            format: 'YYYY-MM-DD HH:mm:ss',
            parseOptions: { useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true },
            formatOptions: { useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true },
        }),
        NbMomentDateModule,
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
        NbProgressBarModule,
        routing,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        AceEditorModule,
        NbSelectModule,
        NbDatepickerModule,
        DateTimePickerModule,
        NbInputModule,
        FullCalendarModule
    ],
    declarations: [
        PollsPage,
        AddPollModal,
        EditPollModal,
        PollCell,
        EditQuestionModal,
        EditAnswerModal,
        EditOpenAnswerModal,
        AddQuestionModal,
        QuestionCell,
        AnswerCell,
        PollOverview,
        AnswerNode,
        AddAnswerModal,
        AddOpenAnswerModal,
        ReorderQuestionsModal,
        ReorderAnswersModal,
        ImportPollsModal,
        OpenAnswerCell,
        LimitPollsModal,
        PollsCalendarViewModal
        // ShowDashboardModal
    ]
})
export class PollsModule {}
