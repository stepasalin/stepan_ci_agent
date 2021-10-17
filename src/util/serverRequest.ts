import { logger } from './logger';
import { SERVER_HOST, SERVER_PORT } from '../config';
const request = require('request');

export function postToServer(endpoint: String, json: Object) {
  return new Promise<Object>((resolve, _reject) => {
    request.post(
      {
        url: `http://${SERVER_HOST}:${SERVER_PORT}/${endpoint}`,
        json: json,
      },
      function (err: any, httpResponse: any, body: any) {
        logger.info('Sending POST request to server');
        logger.info(`Err ${err}`);
        if (err) {
          logger.error(`Post request finished with ${err}`);
          process.exit(1);
        }
        logger.info(`Http Response ${JSON.stringify(httpResponse)}`);
        const resStatus = httpResponse.statusCode;
        if (resStatus != 200 && resStatus != 201) {
          logger.error(`Response code is ${resStatus}`);
          process.exit(1);
        }
        logger.info(`Body ${JSON.stringify(body)}`);
        resolve(body);
      }
    );
  });
}
