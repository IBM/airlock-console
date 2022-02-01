/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare var tinymce: any;

declare var echarts: any;

declare var $ENV: Env;

interface Env {
  AIRLOCK_API_URL: string;
  AIRLOCK_API_AUTH: string;
  AIRLOCK_AUTH_TYPE: string;
}
