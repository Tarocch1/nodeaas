# NodeaaS SDK

SDK for nodeaas.

## Install

```sh
npm i @tarocch1/nodeaas-sdk
```

## Usage

### HTTP

```js
const { handle } = require('@tarocch1/nodeaas-sdk')

handle(function (payload) {
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
const { handle } = require('@tarocch1/nodeaas-sdk')

handle(function (payload) {
  console.log(payload.time)
})
```
