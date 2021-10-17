import { SERVER_HOST, SERVER_PORT } from '../config';
import http from 'http';
import { logger } from './logger';

function httpOptions(uniqOptions: any, _postData: any) {
  const defaultOptions: any = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
  };
  if (uniqOptions.method == 'POST' || uniqOptions.method == 'PATCH') {
    const dataStringified = JSON.stringify(_postData);
    defaultOptions.headers = {
      'Content-Type': 'application/json',
      'Content-Lenght': dataStringified.length,
    };
  }
  return { ...defaultOptions, ...uniqOptions };
}

export async function makeServerRequest(
  options: object,
  _postData: object
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const requestOptions = httpOptions(options, _postData);
    logger.info(`sending ${JSON.stringify(requestOptions)} request to server`);
    logger.info(`data ${JSON.stringify(_postData)}`);

    const req = http.request(httpOptions(requestOptions, _postData), (res) => {
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
      // req.write(JSON.stringify(_postData));
      req.write('{"a": "123"}');
    }
    req.end();
  });
}
