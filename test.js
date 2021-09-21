process.send({
  statusCode: 200,
  headers: {
    'X-Test': "111"
  },
  body: JSON.stringify({
    token: '{{token}}'
  })
})
