const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const convert = require('koa-connect');

const api1 = require('./api/routes/1');
const api2 = require('./api/routes/2');

const rushWebServer = new Koa();

// Middleware
rushWebServer.use(bodyParser());

// API set n.1: just return what is there as original
rushWebServer.use(api1.routes());
rushWebServer.use(api1.allowedMethods());

// API set n.2: allow update of new colums after processing
rushWebServer.use(api2.routes());
rushWebServer.use(api2.allowedMethods());

rushWebServer.listen(3000, '0.0.0.0', () => {
  console.log('Server running on all the interfaces port 3000');
});

module.exports = rushWebServer;