import { logger } from './logger';
import { urlEncode } from './urlencodeObj';
import { SERVER_HOST, SERVER_PORT, AGENT_NAME, AGENT_GROUP } from '../config';
const request = require('request');

export function postToServer(endpoint: String, json: Object) {
  return new Promise<Object>((resolve, _reject) => {
    request.post(
      {
        url: `http://${SERVER_HOST}:${SERVER_PORT}/${endpoint}`,
        json: json,
      },
      function (err: any, httpResponse: any, body: any) {
        logger.debug(`Sending POST request to ${endpoint}`);
        // logger.debug(`Err ${err}`);
        if (err) {
          logger.error(`Post request finished with ${err}`);
          process.exit(1);
        }
        // logger.debug(`Http Response ${JSON.stringify(httpResponse)}`);
        const resStatus = httpResponse.statusCode;
        if (resStatus != 200 && resStatus != 201) {
          logger.error(`Response code is ${resStatus}`);
          process.exit(1);
        }
        logger.debug(`Response body: ${JSON.stringify(body)}`);
        resolve(body);
      }
    );
  });
}

export function getFromServer(endpoint: String, params: Object) {
  const url = `http://${SERVER_HOST}:${SERVER_PORT}/${endpoint}?${urlEncode(
    params
  )}`;
  return new Promise<Object>((resolve, _reject) => {
    request.get(
      { url: url },
      function (err: any, httpResponse: any, body: any) {
        logger.debug(`Sending GET request to ${url}`);
        // logger.debug(`Err ${err}`);
        if (err) {
          logger.error(`Get request finished with ${err}`);
          process.exit(1);
        }
        // logger.debug(`Http Response ${JSON.stringify(httpResponse)}`);
        const resStatus = httpResponse.statusCode;
        if (resStatus != 200) {
          logger.error(`Response code is ${resStatus}`);
          process.exit(1);
        }
        logger.debug(`Response body: ${JSON.stringify(body)}`);
        resolve(body);
      }
    );
  });
}

export async function getNewAgentId(): Promise<string> {
  const responseBody: any = await postToServer('add-agent', {
    name: AGENT_NAME,
    agentGroup: AGENT_GROUP,
  });
  return responseBody.agent._id;
}

export async function getRun(agentId: String) {
  const responseBody: any = await postToServer('get-run', { agentId: agentId });
  return responseBody;
}

export async function getRunCmd(agentId: String, runId: String) {
  const responseBody: any = await getFromServer('run-command', {
    agentId: agentId,
    runId: runId,
  });

  return JSON.parse(responseBody).runCmd;
}

export async function updateRunStatus(
  agentId: String,
  runId: String,
  newExecutionStatus: String
): Promise<void> {
  await postToServer('upate-run-status', {
    agentId: agentId,
    runId: runId,
    newExecutionStatus: newExecutionStatus,
  });
}

export async function appendRunLog(
  agentId: string,
  runId: string,
  newLogChunk: string
): Promise<void> {
  await postToServer('append-log', {
    agentId: agentId,
    runId: runId,
    newLogContent: newLogChunk,
  });
}

export async function updateAgentStatus(
  agentId: string,
  newStatus: string
): Promise<void> {
  await postToServer('update-agent-status', {
    agentId: agentId,
    newStatus: newStatus,
  });
}
