module.exports = {
  http: {
    port: 80,
    host: '0.0.0.0',
    prefix: '',
  },
  httpFunctions: [
    {
      name: 'http test',
      module: '/path/to/module.js',
      method: 'GET',
      path: /^\/path\/to\/invoke/,
      timeout: 60 * 1000,
    },
  ],
  cronFunctions: [
    {
      cron: '0 * * * * *',
      name: 'cron test',
      module: '/path/to/module.js',
      timeout: 60 * 1000,
    },
  ],
}
