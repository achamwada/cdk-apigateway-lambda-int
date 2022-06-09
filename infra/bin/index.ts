#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { TodoRestAPI } from '../stacks/TodoRestAPI';
import { name as API_STACK_ID } from '../package.json'
import { TodoAPICloudFront } from '../stacks/TodoAPICloudFront';


const app = new App();
const apiGateway = new TodoRestAPI(app, API_STACK_ID, {
  restApiIdSsmPath: "/dx/infra/api-gw/pat/rest-api-id",
  rootResourceIdSsPath: "/dx/infra/api-gw/pat/root-resource-id",
  deploymentStage: "pat",
  env: {
    account: "927362808381",
    region: "eu-west-1"
  }
});




// new TodoAPICloudFront(app, "CloudFront", {
//   apiGateway: apiGateway.api
// })