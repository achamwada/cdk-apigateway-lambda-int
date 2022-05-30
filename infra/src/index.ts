
var uuid = require('node-uuid')
exports.handler = async (event: any, context: any) => {
    let statusCode = 200
    let body = 'Hello from Lambda!'
    const { awsRequestId } = context
    const contentKey = event.params.querystring.contentKey
    if (contentKey === 'test404') {
        statusCode = 404
        body = 'Content not found test' + uuid.v4()
        context.fail(JSON.stringify({
            statusCode,
            body,
            contentKey,
            awsRequestId
        }))
    }
    if (contentKey === 'test500') {
        statusCode = 500
        body = 'Server Error'
        const response = {
            "statusCode": statusCode,
            "body": body,
            awsRequestId
        }
        return context.fail(JSON.stringify(response))
    }
    return {
        statusCode,
        body,
        awsRequestId
    };
};