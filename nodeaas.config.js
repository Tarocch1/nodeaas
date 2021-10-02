module.exports = {
  http: {
    port: 80,
    host: '0.0.0.0',
    prefix: '',
    cors: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  },
  httpFunctions: [
    {
      name: 'test',
      module: './test.js',
      method: 'POST',
      path: /\/test/,
    },
  ],
  cronFunctions: [],
}
