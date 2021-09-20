module.exports = {
  http: {
    port: 80,
    host: '0.0.0.0',
    prefix: '',
  },
  httpFunctions: [
    {
      module: '/path/to/module.js',
      path: /^\/path\/to\/invoke/,
      timeout: 60 * 1000,
    },
  ],
}
