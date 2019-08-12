import { NgModule, ModuleWithProviders } from '@angular/core';
import {CommonModule} from "@angular/common/src/common_module";

import {ModalModule} from "angular2-modal";
@NgModule({
    imports: [ CommonModule, ModalModule ],
    declarations: [  ],
    exports: [  ModalModule ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
            ]
        };
    }
}