import * as core from '@actions/core';
import * as github from '@actions/github';
import fetch from 'node-fetch';

const get = async (url: string, token: string): Promise<any> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!~[200, 204].indexOf(response.status)) {
    const text: any = await response.text();
    let message = `[${response.status}] ${text || '(no body)'} at ${url}`;
    try {
      const result: any = JSON.parse(text);
      if (result.message) message = `[${response.status}] ${result.message} at ${url}`;
    } catch (err: any) {}
    throw new Error(message);
  }

  const result: any = await response.json();
  if (result.error) throw new Error(`${result.message}`);
  return result;
};

async function run(): Promise<void> {
  try {
    const endpoint = core.getInput('endpoint') || 'https://api.cloudtype.io';
    const token = core.getInput('token');
    const ghtoken = core.getInput('ghtoken');
    const scope = core.getInput('scope');
    const repo = core.getInput('repo');
    const readOnly = core.getInput('readOnly') === 'true' ? true : false;

    if (!ghtoken) throw new Error(`variable ghtoken(github token) is required`);
    if (!repo) throw new Error(`variable repo is required`);

    core.info(`⭐ Connect ${repo} with ${scope || '(your)'} scope ghtoken is ${ghtoken}`);

    const keyset = await get(`${endpoint}/scope/${scope || '$user'}/deploykey?url=git@github.com:${repo}.git`, token);
    const sshkey = keyset.sshkey;
    const keycompare = sshkey.split(' ')[0] + ' ' + sshkey.split(' ')[1];

    core.info(`👀 Deploy Key is ${sshkey}`);

    const octokit = github.getOctokit(ghtoken);
    const deploykeys = await octokit.request(`GET /repos/${repo}/keys`);
    let deploykey = deploykeys?.data?.find((deploykey: any) => deploykey.key === keycompare);

    // remove key if diff read_only
    if (deploykey && deploykey.read_only !== readOnly) {
      core.info(`💀 Delete key for rewrite`);
      await octokit.request(`DELETE /repos/${repo}/keys/${deploykey.id}`);
      deploykey = null;
    }

    // create deploy key if not found
    if (!deploykey) {
      core.info(`👉 Write key`);
      await octokit.request(`POST /repos/${repo}/keys`, {
        key: sshkey,
        read_only: readOnly
      });
    }

    core.info('✅ Success - init');
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
