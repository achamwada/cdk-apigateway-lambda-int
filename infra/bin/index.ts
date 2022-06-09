#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { RestAPI } from '../stacks/RestAPI';
import { name as API_STACK_ID } from '../package.json'


const app = new App();
new RestAPI(app, API_STACK_ID, {
  restApiIdSsmPath: "/dx/infra/api-gw/pat/rest-api-id",
  rootResourceIdSsPath: "/dx/infra/api-gw/pat/root-resource-id",
  env: {
    account: "927362808381",
    region: "eu-west-1"
  }
});