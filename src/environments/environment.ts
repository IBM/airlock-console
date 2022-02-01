/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  AIRLOCK_API_URL: $ENV.AIRLOCK_API_URL,
  VERSION: '6.0',
  AIRLOCK_API_AUTH: $ENV.AIRLOCK_API_AUTH,
  AIRLOCK_STATIC_FEATURE_MODE: 'FALSE',
  AIRLOCK_COHORTS_MODE: 'TRUE',
  AIRLOCK_ANALYTICS_URL: 'https://analytics1.airlock.twcmobile.weather.com',
};
