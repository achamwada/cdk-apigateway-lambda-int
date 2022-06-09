import { Stack, StackProps } from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { APICloudFront } from "../constructs/APICloudFront";

export interface TodoAPICloudFrontProps extends StackProps {
    apiGateway: RestApi

}
export class TodoAPICloudFront extends Stack {
    constructor(scope: Construct, id: string, props: TodoAPICloudFrontProps) {
        super(scope, id, props)

        new APICloudFront(this, "API", {
            apiGateway: props.apiGateway
        })


    }

}