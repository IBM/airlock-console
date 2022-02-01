/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {
  NbAutocompleteModule,
  NbCardModule,
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
} from '@nebular/theme';
import {AuthorizationService} from './services/authorization.service';
import {AirlockService} from './services/airlock.service';
import {StringsService} from './services/strings.service';
import {GlobalState} from "./global.state";
import {AuthGuard} from "./services/auth-guard.service";
import {AuthenticationService} from "./services/authentication.service";
import {TransparentSpinner} from "./@theme/airlock.components/transparentSpinner";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {TreeviewModule} from "ngx-treeview";
import {TagInputModule} from "ngx-chips-angular";
import {UserGroupsInput} from "./@theme/airlock.components/userGroupsInput";
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {TransparentInlineSpinner} from "./@theme/airlock.components/transparentInlineSpinner";
import {NgxSelectModule} from "ngx-select-ex";
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // a plugin!

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

const APP_PROVIDERS = [
  // AppState,
  GlobalState,
  AirlockService,
  AuthGuard,
  AuthenticationService,
  AuthorizationService,
  TransparentSpinner,
  TransparentInlineSpinner,
  NbCardModule,
  StringsService,
  {provide: LocationStrategy, useClass: HashLocationStrategy}
];

export enum AceExpandDialogType {
  FEATURE_RULE,
  FEATURE_PREMUIM_RULE,
  CONFIG_SCHEMA,
  DEFAULT_CONFIG,
  REFERENCE_SCHEMA,
  INPUT_SCHEMA,
  OUTPUT_CONFIG,
  STREAM_FILTER,
  STREAM_PROCESSOR,
  STREAM_SCHEMA,
  NOTIFICATION_CANCELLATION_RULE,
  NOTIFICATION_REGISTRATION_RULE
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TagInputModule,
    AppRoutingModule,
    NbAutocompleteModule,
    NgxSelectModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TreeviewModule.forRoot(),
    FullCalendarModule
  ],
  bootstrap: [AppComponent],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    // ENV_PROVIDERS,
    APP_PROVIDERS,
  ],
})
export class AppModule {
}
