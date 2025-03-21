const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const convert = require('koa-connect');
const koaStatic = require('koa-static');
const koaMount = require('koa-mount');
const path = require('path');

const api1 = require('./api/routes/1');
const api2 = require('./api/routes/2');

const rushWebServer = new Koa();

// Middleware
rushWebServer.use(bodyParser());

// Static content
rushWebServer.use(koaMount('/', koaStatic(path.join(__dirname, '..', 'static'))))

// API set n.1: just return what is there as original
rushWebServer.use(api1.routes());
rushWebServer.use(api1.allowedMethods());

// API set n.2: allow update, save, configure, etc.. of new colums
// set 1 serve the original
// processing happens
// set 2 save the new results
rushWebServer.use(api2.routes());
rushWebServer.use(api2.allowedMethods());

// rushWebServer.listen(3123, '0.0.0.0', () => {
rushWebServer.listen(3123, () => {
  console.log('Server running on all the interfaces port 3123');
});

module.exports = rushWebServer;
