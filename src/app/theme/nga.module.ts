import { NgModule, ModuleWithProviders }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  BaThemeConfig
} from './theme.config';

import {
  BaThemeConfigProvider
} from './theme.configProvider';

import {
  BaBackTop,
  BaCard,
  BaChartistChart,
  BaCheckbox,
  BaContentTop,
  BaFullCalendar,
  BaMenuItem,
  BaMenu,
  BaMsgCenter,
  BaMultiCheckbox,
  BaPageTop,
  BaPictureUploader,
  BaSidebar
} from './components';

import { BaCardBlur } from './components/baCard/baCardBlur.directive';

import {
  BaScrollPosition,
  BaSlimScroll,
  BaThemeRun
} from './directives';

import {
  BaAppPicturePipe,
  BaKameleonPicturePipe,
  BaProfilePicturePipe
} from './pipes';

import {
  BaImageLoaderService,
  BaMenuService,
  BaThemePreloader,
  BaThemeSpinner
} from './services';

import {
  EmailValidator,
  EqualPasswordsValidator
} from './validators';
import {AboutModal} from "./airlock.components/aboutModal/aboutModal.component";
import {ProfileModal} from "./airlock.components/profileModal/profileModal.component";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {SimpleNotificationsModule} from "angular2-notifications";
import {DropdownModule, PopoverModule} from "ng2-bootstrap";
import {BaActionCard} from "./airlock.components/baActionCard/baActionCard.component";
import {SelectModule} from "ng2-select";
import {AddBranchModal} from "./airlock.components/addBranchModal/addBranchModal.component";
import {AirlockTooltip} from "./airlock.components/airlockTooltip/airlockTooltip.component";
import ALCommonsModule from "../pages/common.module";
import {ReplaceLineBreakPipe} from "./pipes/replaceLineBreak/replaceLineBreak.pipe";

const NGA_COMPONENTS = [
  BaBackTop,
  BaCard,
  BaActionCard,
  BaChartistChart,
  BaCheckbox,
  BaFullCalendar,
  BaMenuItem,
  BaMenu,
  BaMsgCenter,
  BaMultiCheckbox,
  BaPageTop,
  BaPictureUploader,
  BaSidebar,
  BaContentTop,
  AboutModal,
  ProfileModal,
  AddBranchModal,
  AirlockTooltip
];

const NGA_DIRECTIVES = [
  BaScrollPosition,
  BaSlimScroll,
  BaThemeRun,
  BaCardBlur
];

const NGA_PIPES = [
  BaAppPicturePipe,
  BaKameleonPicturePipe,
  BaProfilePicturePipe,
  ReplaceLineBreakPipe
];

const NGA_SERVICES = [
  BaImageLoaderService,
  BaThemePreloader,
  BaThemeSpinner,
  BaMenuService
];

const NGA_VALIDATORS = [
  EmailValidator,
  EqualPasswordsValidator
];

@NgModule({
  declarations: [
    ...NGA_PIPES,
    ...NGA_DIRECTIVES,
    ...NGA_COMPONENTS
  ],
  imports: [
    CommonModule,
    PopoverModule.forRoot(),
    RouterModule,
    FormsModule,
    SelectModule,
    ReactiveFormsModule,
    Ng2Bs3ModalModule,
    SimpleNotificationsModule,
    DropdownModule.forRoot(),
  ],
  exports: [
    ...NGA_PIPES,
    ...NGA_DIRECTIVES,
    ...NGA_COMPONENTS
  ]
})
export class NgaModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders> {
      ngModule: NgaModule,
      providers: [
        BaThemeConfigProvider,
        BaThemeConfig,
        ...NGA_VALIDATORS,
        ...NGA_SERVICES
      ],
    };
  }
}
