import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    // parameters
    const parameters  = event?.pathParameters;
    const movieId = parameters?.movieId ? parseInt(parameters.movieId) : undefined;  
    
    console.log("Event: ", event);
    const body = event.body ? JSON.parse(event.body) : undefined; // parse request body
    if (!body) { // if no request body, return error
      return {
        statusCode: 500,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "No request body." }),
      };
    }

    if (!movieId) {
        // if no valid movie id, return error
        return {
            statusCode: 404,
            headers: { "content-type": "application/json" },
        body: JSON.stringify({ Message: "No valid movie Id." }),
      };
    }

    const commandOutput = await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { movieId: movieId },
      })
    );
    console.log("DeleteCommand response: ", commandOutput); // log response

    // return successful response
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Movie deleted successfully." }),
    };
  } catch (error: any) {
    // return error if exception
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}