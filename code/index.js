exports.handler = async (event, context) => {
    let statusCode = 200
    let body = [
        {
            userId: 1,
            id: 1,
            title: "delectus aut autem",
            completed: false
        },
        {
            userId: 1,
            id: 2,
            title: "quis ut nam facilis et officia qui",
            completed: false
        },
        {
            userId: 1,
            id: 3,
            title: "fugiat veniam minus",
            completed: false
        },
        {
            userId: 1,
            id: 4,
            title: "et porro tempora",
            completed: true
        }]
    const { awsRequestId } = context
    const contentKey = event.params.querystring.contentKey
    if (contentKey === 'test404') {
        statusCode = 404
        body = 'Content not found'
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