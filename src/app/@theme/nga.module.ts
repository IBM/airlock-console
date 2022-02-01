import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {
    BaContentTop,
} from './components';
import {BaCardBlur} from './components/baCard/baCardBlur.directive';
import {BaScrollPosition, BaThemeRun} from './directives';
import {BaImageLoaderService, BaThemePreloader, BaThemeSpinner} from './services';
import {EmailValidator, EqualPasswordsValidator} from './validators';
import {BaActionCard} from "./airlock.components/baActionCard/baActionCard.component";
import {AirlockTooltip} from "./airlock.components/airlockTooltip/airlockTooltip.component";
import {BaThemeConfigProvider} from "./theme.configProvider";
import {BaThemeConfig} from "./theme.config";
import {BaAppPicturePipe} from "./pipes/baAppPicture";
import {BaProfilePicturePipe} from "./pipes/baProfilePicture";
import {BaKameleonPicturePipe} from "./pipes/baKameleonPicture";
import {ReplaceLineBreakPipe} from "./pipes/replaceLineBreak";
import {PopoverModule} from "ngx-bootstrap/popover";
import { NgSelectModule } from '@ng-select/ng-select';
import {AboutModal} from "./modals/aboutModal";
import {NbCardModule, NbPopoverModule} from "@nebular/theme";
import {ProfileModal} from "./modals/profileModal";
import {ConfigurationCell} from "./airlock.components/configurationCell";
import {BaCard} from "./components/baCard";

const NGA_COMPONENTS = [
    BaCard,
    BaActionCard,
    BaContentTop,
    AboutModal,
    ProfileModal,
    // AddBranchModal,
    AirlockTooltip,
    ConfigurationCell
];

const NGA_DIRECTIVES = [
    BaScrollPosition,
    // BaSlimScroll,
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
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        PopoverModule,
        NbPopoverModule,
        NgSelectModule,
        NbCardModule,
    ],
    exports: [
        ...NGA_PIPES,
        ...NGA_DIRECTIVES,
        ...NGA_COMPONENTS
    ]
})
export class NgaModule {
    static forRoot(): ModuleWithProviders<any> {
        return <ModuleWithProviders<any>>{
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
