
import { CloudFrontToApiGateway } from '@aws-solutions-constructs/aws-cloudfront-apigateway';
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
interface APICloudFrontProps {
    apiGateway: RestApi
}

export class APICloudFront extends Construct {
    constructor(scope: Construct, id: string, props: APICloudFrontProps) {
        super(scope, id)
        this.createCDN(props.apiGateway)

    }

    private createCDN(apiGateway: RestApi): CloudFrontToApiGateway {
        return new CloudFrontToApiGateway(this, 'CDN', {
            existingApiGatewayObj: apiGateway
        });
    }

}