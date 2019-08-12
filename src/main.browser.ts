
/*
 * App Component
 * our top level component that holds all of our components
 */
import {AuthorizationService} from "./app/services/authorization.service";
import {AuthGuard} from './app/services/auth-guard.service';
import {AuthenticationService} from "./app/services/authentication.service";
import {NotificationsService} from "angular2-notifications";
/*
 * Bootstrap our Angular app with a top level component `App` and inject
 * our Services and Providers into Angular's dependency injection
 */
// export function main(initialHmrState?: any): Promise<any> {
//
//   return bootstrap(App, [
//     // To add more vendor providers please look in the platform/ folder
//     ...PLATFORM_PROVIDERS,
//     ...ENV_PROVIDERS,
//     ...APP_PROVIDERS,
//       MODAL_BROWSER_PROVIDERS,
//     AuthorizationService,
//     AuthenticationService,
//       AuthGuard,
//     NotificationsService
//   ])
//     .then(decorateComponentRef)
//     .catch(err => console.error(err));
//
// }
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { decorateModuleRef } from './app/environment';
import { bootloader } from '@angularclass/hmr';
import { AppModule } from './app';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {
  return platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .then(decorateModuleRef)
      .catch(err => console.error(err));

}


bootloader(main);

