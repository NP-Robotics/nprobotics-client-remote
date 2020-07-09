const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const Dynamo = {
    async get(RobotID, TableName) {
        const params = {
            TableName,
            Key: {
                RobotID,
            },
        };

        const data = await documentClient.get(params).promise();

        if (!data || !data.Item) {
            throw Error(`There was an error fetching the data for RobotID of ${RobotID} from ${TableName}`);
        }
        console.log(data);

        return data.Item;
    },
};
module.exports = Dynamo;