import { SERVER_HOST, SERVER_PORT } from '../config';
import https from 'https';
import { logger } from './logger';

function httpOptions(uniqOptions = {}) {
  const defaultOptions = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
  };
  return { ...defaultOptions, ...uniqOptions };
}

export async function makeServerRequest(
  options: object,
  _postData: object
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    logger.info(`sending ${options} request to server`);
    const req = https.request(httpOptions(options), (res) => {
      if (res.statusCode == undefined) {
        return reject(new Error('server response status is undefined'));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        // reject on bad status
        return reject(new Error('statusCode=' + res.statusCode));
      }

      // cumulate data
      let resData: any[] = [];
      res.on('data', function (chunk) {
        resData.push(chunk);
      });

      // resolve on end
      res.on('end', function () {
        try {
          resData = JSON.parse(Buffer.concat(resData).toString());
        } catch (e) {
          reject(e);
        }
        logger.info(
          `server responded with code ${res.statusCode}, data ${resData}`
        );
        resolve(resData);
      });
    });
    // reject on request error
    req.on('error', function (err) {
      reject(err);
    });

    if (_postData) {
      req.write(_postData);
    }
    req.end();
  });
}
