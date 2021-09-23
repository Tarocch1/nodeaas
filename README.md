# NodeaaS

A simple Node.js FaaS framework.

## TODO

- [x] Configurable
- [x] Http trigger
- [ ] Cron trigger
- [x] Node.js SDK

## Install

```sh
npm i -g @tarocch1/nodeaas
```

## Usage

```sh
nodeaas -c ./nodeaas.config.js
```

### HTTP

#### Config

HTTP 配置包含两部分：`http`，`httpFunctions`。前者配置 http 服务，后者配置 http 函数。

`http` 包含以下配置项：

```ts
export type THttpConfig = {
  port: number // 端口
  host: string // 地址
  prefix: string // path 前缀
  jwt?: TJwtConfig // jwt 配置
}
```

当设置了前缀时，系统会先匹配前缀，匹配上之后，再用剩余部分匹配函数 path。

jwt 为可选配置，未配置时不会开启 jwt 功能。jwt 功能可以实现自动化的 token 发放、验证以及刷新。

jwt 配置如下：

```ts
export type TJwtConfig = {
  key: string
  location: JWT_LOCATION
  name: string
  cookie: CookieSerializeOptions
}
```

目前，jwt 只支持 HS256 算法，不可配置，`key` 用于配置 hmac 密钥。

`location` 表示 token 存放位置，可选值包括：cookie、header、param。系统会根据此设置从请求中拿到 token 进行鉴权。其中，cookie 名称、param 参数名由 `name` 配置项指定，`location` 设置为 header 时，从 `authorization` 头中获取 token，会自动去除 Bearer 前缀。

对于需要认证的接口，系统拿到 token 并验证无误后，会自动将 payload 传递给函数。

对于签名接口（一般是登录接口），系统会将计算好的 token 放在 cookie 里，`cookie` 用于配置生成 cookie 的选项，详见 https://github.com/jshttp/cookie#cookieserializename-value-options。

`httpFunctions` 配置是一个数组，每一项结构如下：

```ts
export type THttpFunctionConfig = {
  name: string // 函数名称
  module: string // 函数 js 文件
  path: RegExp // http 路由正则
  timeout?: number // 超时时间，默认 60 秒
  jwt?: JWT_METHOD // 接口的 jwt 功能
}
```

`jwt` 配置包含三个选项：sign、verify、refresh。

sign 表示签名接口，一般用于登录，函数返回 200 状态码时，系统自动计算 token 并返回给调用方。

verify 为验证接口，表示该接口需要验证 token，系统自动验证 token，token 不合法直接返回 401，token 合法时将 payload 传给函数使用。

refresh 表示刷新 token 的接口，函数返回 200 状态码时，系统自动计算 token 并返回给调用方。

#### Function

函数通过 child_process 创建，创建后，主进程会将请求上下文传递给函数，上下文内容包括：

```ts
export type THttpBody = Record<string, unknown> | Buffer
export type THttpPayload = Pick<
  http.IncomingMessage,
  | 'aborted'
  | 'httpVersion'
  | 'httpVersionMajor'
  | 'httpVersionMinor'
  | 'complete'
  | 'headers'
  | 'rawHeaders'
  | 'trailers'
  | 'rawTrailers'
  | 'method'
  | 'url'
> & {
  ip: string
  ips: string[]
  body: THttpBody
  jwt?: Record<string, unknown>
}
```

系统会自动解析 content-type 为 json 或 form-urlencoded 的 body 数据，转成对象传给函数，其余情况均为 Buffer。`jwt` 包含了 token 的 payload 部分。

函数通过监听 message 事件获取 payload，通过 `process.send()` 传递返回值，返回值格式如下：

```ts
export type THttpResult = {
  statusCode?: number
  headers?: NodeJS.Dict<string | string[]>
  jwt?: Record<string, unknown>
  body?: string | Buffer
}
```

其中，`jwt` 表示签名接口用于生成 token 的 payload 值。

### SDK

提供 sdk 供函数接入，使编写函数更方便。

```sh
npm i @tarocch1/nodeaas-sdk
```

使用：

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

