# NodeaaS SDK

SDK for nodeaas.

## Install

```sh
npm i @tarocch1/nodeaas-sdk
```

## Usage

### HTTP

```js
const { handleHttp } = require('@tarocch1/nodeaas-sdk')

handleHttp(function (payload) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-My-Header': payload.ip,
    },
    body: JSON.stringify({
      data: {},
    }),
  }
})
```

### Cron

```js
const { handleCron } = require('@tarocch1/nodeaas-sdk')

handleCron(function (payload) {
  console.log(payload.time)
})
```
