/*************************************************
 * Todoist Completer
 *
 * Automatically completes any Todoist task tagged with @done
 *
 * It's based on labels and uses your API key, so you'll need
 * to be a Todoist Premium customer:
 * https://todoist.com/premium
 *
 * You'll need your API token:
 * https://todoist.com/prefs/integrations
 *
 * Todoist API documentation:
 * https://developer.todoist.com/sync/v8/
 *
 **************************************************/

const TODOIST_TOKEN = 'YOUR_TOKEN_HERE';
const TAG_NAME = 'done'; // auto-complete all items tagged with @done

const axios = require('axios');
const _ = require('lodash');

class Todoist {
  constructor({ token, tag }) {
    this.syncToken = '*';
    this.token = token;
    this.tag = tag;
  }

  async cron() {
    const resp = await this.post({
      resource_types: JSON.stringify(['projects', 'items', 'labels', 'reminders'])
    });

    const resources = resp.data;
    const doneLabel = _.find(resources.labels, l => l.name.toLowerCase() == this.tag );
    const dones = _.select(resources.items, i => _.includes(i.labels, doneLabel.id));

    if(dones.length == 0){
      console.log('no items to complete - exiting');
      return;
    } else {
      dones.forEach(d => console.log(`completing item: ${d.id}`) )
    }

    const command = [{
      type: 'item_complete',
      uuid: uuid(),
      args: {
        ids: dones.map(d => d.id)
      }
    }];

    const cmdResp = await this.post({
      commands: JSON.stringify(command)
    });

    return cmdResp;
  }

  async post(body) {
    const reqData = _.merge({}, body, {
      token: this.token,
      sync_token: this.syncToken
    });

    const resp = await axios({
      method: 'post',
      url: 'https://todoist.com/api/v7/sync',
      data: reqData
    });

    this.syncToken = resp.data.sync_token;

    return resp;
  }
}

// generates UUIDs: https://gist.github.com/jed/982883
function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)};

// lambda function
exports.handler = async (event) => {
  const td = new Todoist({token: TODOIST_TOKEN, tag: TAG_NAME });
  const resp = await td.cron();
  return resp;
};
