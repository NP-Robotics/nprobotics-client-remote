const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');

const tableName = process.env.tableName;

exports.handler = async event => {
    console.log('event', event);

    if (!event.pathParameters || !event.pathParameters.RobotID) {
        // failed without an ID
        return Responses._400({ message: 'missing the RobotID from the path' });
    }

    let RobotID = event.pathParameters.RobotID;

    const Robot = await Dynamo.get(RobotID, tableName).catch(err => {
        console.log('error in Dynamo Get', err);
        return null;
    });

    if (!Robot) {
        return Responses._400({ message: 'Failed to get user by RobotID' });
    }

    return Responses._200({ Robot });
};