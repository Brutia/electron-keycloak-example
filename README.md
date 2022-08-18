# Keycloak electron example

this example shows how to perform authentication with keycloak on electron app

you need a running keycloak server 

## usage 

`npm install`

`npm run start`

click on "login" button, a new windows will prompt with the keycloak login page. Enter your login informations and then the token will be sent to main.js throught ipcRender.send