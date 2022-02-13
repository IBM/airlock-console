# airlock-console

For getting the environment set you need to run the command 
    'npm install'

For running on dev mode you need to do the following
1. verify there is no environment variables : AIRLOCK_API_AUTH , AIRLOCK_OKTA_URL, AIRLOCK_API_URL (use 'unset <variable>' command)
2. run command 'ng serve'
  
For running on prod mode you need to do the following:
1. set the following environment variables : AIRLOCK_API_AUTH , AIRLOCK_OKTA_URL, AIRLOCK_API_URL (use 'export <variable> = <value> command'
2. run command 'npm start'
