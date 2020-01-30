/*************************************************
 *
 * Github Old Issue Closer
 * a cronulent by atevans
 *
 * This cron job should run once a day or once a week, depending on how frequently you want to
 * "clean up" old Github issues. It will close any issue created by you which is older than the
 * time period defined under the EXPIRY variable. Before closing, it will post a comment (as you)
 * explaining how any why the issue was closed. Feel free to modify the COMMENT variable with
 * something you would rather post.
 *
 * You'll need a Github Personal Access Token to use this script - generate one here:
 * https://github.com/settings/tokens/new
 *
 * It will need to have the "repo" scope for "full control of private repositories."
 * This is a little dangerous, since it gives Cronulent full access to any Github repo
 * you have access to. Unfortunately, there's no finer way to slice permissions on Github
 * without a full Github App. Please consider the risks to your personal or business
 * account of granting this access to Cronulent.
 *
 **************************************************/



const axios = require('axios');
const moment = require('moment');

const TOKEN = 'YOUR_TOKEN_HERE';
const EXPIRY = moment().subtract(3, 'years');
const COMMENT = `
  Hi! I'm using [Cronulent](https://www.cronulent.com) to automatically close my old Github issues. Since this issue hasn't seen any activity in 3 years or more, I'm going to close it now. Please re-open it or @ me if there is more to do or discuss here. Thanks!
`.trim();

// lambda function
exports.handler = async (event) => {
  return await processIssues();
};

async function processIssues() {
  const issuesResponse = await axios({
    method: 'GET',
    url: 'https://api.github.com/issues',
    params: {
      filter: 'created',  // only issues created by me
      sort: 'updated',    // sort by updated_at
      direction: 'asc',   // oldest issues first
      state: 'open'       // only open issues
    },
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'cronulent-github-issue-closer'
    }
  });

  for(const issue of issuesResponse.data) {
    // updated_at will be changed when a new comment is made on an issue,
    // so relying on that will filter for only issues that have not seen
    // any activity in a long time, as opposed to issues created a long time
    // ago that are still ongoing
    const issueTime = moment(issue.updated_at);

    // if the issue was created after the expiry time, ignore it
    if(issueTime.isAfter(EXPIRY)) continue;

    // if it is not an issue, but instead a pull request, ignore it
    if(issue.pull_request) continue;

    console.log(`Closing issue "${issue.title}" | ${issue.html_url}`);

    // otherwise, leave a comment...
    const commentResponse = await axios({
      method: 'POST',
      url: issue.comments_url,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'cronulent-github-issue-closer'
      },
      data: {
        body: COMMENT
      }
    });

    // ...and close the issue
    const updateResponse = await axios({
      method: 'PATCH',
      url: issue.url,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'cronulent-github-issue-closer'
      },
      data: {
        state: 'closed'
      }
    });
  }
}
