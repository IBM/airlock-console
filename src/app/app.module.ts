import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';
import { ModalModule } from 'angular2-modal';


/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { routing } from './app.routing';

// App is our top level component
import { App } from './app.component';
import { AppState, InternalStateType } from './app.service';
import { GlobalState } from './global.state';
// import { NgaModule } from './theme/nga.module';
// import { PagesModule } from './pages/pages.module';
import {AirlockService} from "./services/airlock.service";
import {StringsService} from "./services/strings.service";
import {NgaModule} from "./theme/nga.module";
import {PagesModule} from "./pages/pages.module";
import {AuthGuard} from "./services/auth-guard.service";
import {AuthenticationService} from "./services/authentication.service";
import {AuthorizationService} from "./services/authorization.service";
import {TransparentSpinner} from "./theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {NotificationsService} from "angular2-notifications/lib/notifications.service";
import {SimpleNotificationsComponent} from "angular2-notifications/lib/simple-notifications.component";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {SimpleNotificationsModule} from "angular2-notifications";
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import {ToastrModule} from "ngx-toastr";
import {TransparentInlineSpinner} from "./theme/airlock.components/transparentInlineSpinner/transparentInlineSpinner.service";
// Application wide providers
const APP_PROVIDERS = [
  AppState,
  GlobalState,
  AirlockService,
  StringsService,
  ,AuthGuard,AuthenticationService,AuthorizationService,TransparentSpinner,TransparentInlineSpinner,NotificationsService, SimpleNotificationsComponent,Ng2Bs3ModalModule,StringsService

];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

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

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [App],
  declarations: [
    App,
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    HttpModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    NgaModule.forRoot(),
    ToastrModule.forRoot({preventDuplicates:true}),
    SimpleNotificationsModule,
    PagesModule,/*,GroupsModule,ProductsModule,FeaturesModule,*/
    routing
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})

export class AppModule {

  constructor(public appRef: ApplicationRef, public appState: AppState, public airlockService: AirlockService) {
  }

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }
    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
