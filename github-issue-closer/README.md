# Github Issue Closer

Automatically close your old Github Issues.

You'll need a Github Personal Access Token, and you can [generate one here](https://github.com/settings/tokens/new). Unfortunately, to read and modify issues, you will need to grant this cron job the "Repo" scope, which grants "Full control of private repositories" to Cronulent. Please consider the risks of granting your cron job access to all your private repos, including ones for your business, before deploying this cron job.

You can change the `EXPIRY` constant to change the period after which old issues will be closed. As coded, it will close issues older than 3 years. The cron job will post a comment before closing the issue explaining the reason for closing it; you can modify the `COMMENT` variable to change this message.

Further reading:

- [Github Developer API v3 - Issues](https://developer.github.com/v3/issues/)
- [Github oAuth Scopes](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/)
- [New Personal Access Token](https://github.com/settings/tokens/new)
- [momentjs - manipulating dates](https://momentjs.com/docs/#/manipulating/)
- [axios - easy JS http requests](https://github.com/axios/axios)
