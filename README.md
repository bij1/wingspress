# wingspress

Tool for migrating Wings content to WordPress.

## `yarn fetch`

Fetches all content from Wings and saves it to `content.json`,
requires the following environment variables.

```
WINGS_ENDPOINT
WINGS_PROJECT
WINGS_APP_KEY
```

## `yarn migrate`

Converts all articles and pages that do not exist in WordPress yet and
publishes them along with their media, requires the following
environment variables.

```
WP_ENDPOINT
WP_USER
WP_PASSWORD
```
