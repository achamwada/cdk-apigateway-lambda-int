
import { Stack, StackProps } from "aws-cdk-lib";
import { RestApi, PassthroughBehavior, Model, LambdaIntegration, RequestValidator } from "aws-cdk-lib/aws-apigateway"
import { Architecture, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { contentNotFoundSchema, internalServerErrorSchema } from "./schemas";

import { json404Response, json500Response, jsonRequest } from "./templates";

interface LambdaResourceProps extends StackProps {
    restApiId: string, // /dx/infra/api-gw/dev1-blue/rest-api-id
    rootResourceId: string // /dx/infra/api-gw/dev1-blue/root-resource-id
}

export class LambdaResource extends Stack {
    constructor(scope: Construct, id: string, props: LambdaResourceProps) {
        super(scope, id, props)

        const contentLambda = new Function(this, "ContentLambda", {
            code: Code.fromAsset("../code"),
            handler: "index.handler",
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.X86_64,
        })
        const api = RestApi.fromRestApiAttributes(this, "ImportedAPI", {
            restApiId: props.restApiId,
            rootResourceId: props.rootResourceId

        })
        const v2 = api.root.addResource('v2')

        const content = v2.addResource('content');

        const integration = new LambdaIntegration(contentLambda, {
            proxy: false,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
            requestTemplates: {
                "application/json": jsonRequest
            },
            integrationResponses: [
                {
                    statusCode: "200",

                },
                {
                    statusCode: "404",
                    selectionPattern: ".*Content not found.*",
                    responseTemplates: {
                        "application/json": json404Response
                    }
                },
                {
                    statusCode: "500",
                    selectionPattern: ".*Server Error.*",
                    responseTemplates: {
                        "application/json": json500Response
                    }
                }]
        })


        const responseModel404 = new Model(this, "ResponseModel404", {
            restApi: api,
            schema: contentNotFoundSchema,
            contentType: "application/json",
            description: "Model when a 404 response is encountered from lambda",
            modelName: "ContentNotFoundModel"
        })

        const responseModel500 = new Model(this, "responseModel500", {
            restApi: api,
            schema: internalServerErrorSchema,
            contentType: "application/json",
            description: "Model when a 500 response is encountered from lambda",
            modelName: "InternalServerErrorModel"
        })
        content.addMethod('GET', integration, {
            apiKeyRequired: false,
            methodResponses: [
                {
                    statusCode: "200"
                },
                {
                    statusCode: "404",
                    responseModels: {
                        "application/json": responseModel404
                    }
                },
                {
                    statusCode: "500",
                    responseModels: {
                        "application/json": responseModel500
                    }
                }
            ],
            requestParameters: {
                "method.request.querystring.contentKey": true
            },
            requestValidator: new RequestValidator(this, "QueryRequestValidator", {
                restApi: api,
                requestValidatorName: "ContentQueryParamValidator",
                validateRequestParameters: true,
            })
        });


    }
}