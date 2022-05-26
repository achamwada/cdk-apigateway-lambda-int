import { JsonSchema, JsonSchemaVersion, JsonSchemaType, Model } from "aws-cdk-lib/aws-apigateway"

export const contentNotFoundSchema: JsonSchema = {
    title: "ContentNotFoundModel",
    schema: JsonSchemaVersion.DRAFT4,
    type: JsonSchemaType.OBJECT,
    properties: {
        statusCode: {
            type: JsonSchemaType.NUMBER
        },
        contentKey: {
            type: JsonSchemaType.STRING
        },
        message: {
            type: JsonSchemaType.STRING
        },
        correlationId: {
            type: JsonSchemaType.STRING
        },


    },
    required: ["statusCode", "contentKey", "message", "correlationId"]
}

export const internalServerErrorSchema: JsonSchema = {
    title: "InternalServerErrorModel",
    schema: JsonSchemaVersion.DRAFT4,
    type: JsonSchemaType.OBJECT,
    properties: {
        statusCode: {
            type: JsonSchemaType.NUMBER
        },
        message: {
            type: JsonSchemaType.STRING
        },
        correlationId: {
            type: JsonSchemaType.STRING
        },


    },
    required: ["statusCode", "message", "correlationId"]
}
