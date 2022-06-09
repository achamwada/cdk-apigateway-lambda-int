import { RestApi, LambdaIntegration, PassthroughBehavior, Model, RequestValidator, IRestApi, Resource, Deployment, Stage, LogGroupLogDestination, AccessLogFormat, Method } from "aws-cdk-lib/aws-apigateway"
import { Code, Runtime, Architecture, Function } from "aws-cdk-lib/aws-lambda"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs"
import { contentNotFoundSchema, internalServerErrorSchema } from "../utils/schemas"
import { jsonRequest, json404Response, json500Response } from "../utils/templates"
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { name as API_NAME } from '../package.json'

interface TodoRestAPIProps extends StackProps {
    restApiIdSsmPath: string,
    rootResourceIdSsPath: string
    deploymentStage: string
}

interface ResponseModels {
    _404: Model
    _500: Model
}

export class TodoRestAPI extends Stack {
    public api: IRestApi
    private methods: Method[] = []
    public API_URL: string
    constructor(scope: Construct, id: string, props: TodoRestAPIProps) {
        super(scope, id, props)
        this.lookupExistingAPI(props.restApiIdSsmPath, props.rootResourceIdSsPath)
        const resource = this.addNewResource()
        this.attachGetMethodToEndpoint(resource)
        this.deployAPI(props.deploymentStage)

    }

    private lookupExistingAPI(restApiIdSsmPath: string, rootResourceIdSsPath: string): void {
        const restApiId = StringParameter.valueForStringParameter(this, restApiIdSsmPath)
        const rootResourceId = StringParameter.valueForStringParameter(this, rootResourceIdSsPath)

        this.api = RestApi.fromRestApiAttributes(this, "ImportedAPI", {
            restApiId,
            rootResourceId
        }) as RestApi

    }

    private addNewResource(): Resource {
        const v2 = this.api.root.addResource('v2')

        return v2.addResource('todo')
    }

    private attachGetMethodToEndpoint(endpoint: Resource): void {
        const { _404, _500 } = this.generateResponseModels()
        const integration = this.createRequestIntegration()

        const getMethod = endpoint.addMethod('GET', integration, {
            apiKeyRequired: true,
            methodResponses: [
                {
                    statusCode: "200"
                },
                {
                    statusCode: "404",
                    responseModels: {
                        "application/json": _404
                    }
                },
                {
                    statusCode: "500",
                    responseModels: {
                        "application/json": _500
                    }
                }
            ],
            requestParameters: {
                "method.request.querystring.todoKey": true
            },
            requestValidator: new RequestValidator(this, "QueryRequestValidator", {
                restApi: this.api,
                requestValidatorName: "TodosQueryParamValidator",
                validateRequestParameters: true,
            })
        });

        this.methods.push(getMethod)

    }

    private generateResponseModels(): ResponseModels {

        const responseModel404 = new Model(this, "ResponseModel404", {
            restApi: this.api,
            schema: contentNotFoundSchema,
            contentType: "application/json",
            description: "Model when a 404 response is received from lambda",
            modelName: "TodosNotFoundModel"
        })

        const responseModel500 = new Model(this, "responseModel500", {
            restApi: this.api,
            schema: internalServerErrorSchema,
            contentType: "application/json",
            description: "Model when a 500 response is encountered from lambda",
            modelName: "InternalServerErrorModel"
        })


        return {
            _404: responseModel404,
            _500: responseModel500
        }
    }

    private createRequestIntegration(): LambdaIntegration {
        const todoLambda = new Function(this, "TodosLambda", {
            code: Code.fromAsset("../code"),
            handler: "index.handler",
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.X86_64
        })

        return new LambdaIntegration(todoLambda, {
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
                    selectionPattern: ".*Todos not found.*",
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
    }

    private deployAPI(stageName: string): void {
        const deployment = new Deployment(this, "Deployment", {
            api: this.api,
            description: "Publishing API changes",
            retainDeployments: false,
        })


        const logGroup = new LogGroup(this, `${API_NAME}${stageName}Logs`);
        new Stage(this, `${stageName}Stage`, {
            stageName: stageName,
            deployment,
            accessLogDestination: new LogGroupLogDestination(logGroup),
            accessLogFormat: AccessLogFormat.jsonWithStandardFields({
                caller: false,
                httpMethod: true,
                ip: true,
                protocol: true,
                requestTime: true,
                resourcePath: true,
                responseLength: true,
                status: true,
                user: true
            })
        });

        this.methods.forEach(method => {
            deployment.node.addDependency(method)
        })

        deployment.addToLogicalId(Date.now())



    }
}