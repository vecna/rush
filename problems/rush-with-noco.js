const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const convert = require('koa-connect');
const { Noco } = require('nocodb');

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

// what's follow is the webserver initialization for the NocoDB

const nocodbWebServer = new Koa();

// Initialize NocoDB with configuration
Noco.init({
  config: {
    databases: [{
      type: 'sqlite',
      name: 'local',
      file: 'nocodata/database.sqlite'
    }]
  },
  dir: 'src/config/noco',  // Directory to store NocoDB data
  use: ['auth', 'crud', 'schema', 'sql', 'functions', 'api', 'storage', 'remote', 'realtime', 'export', 'import', 'event', 'custom'],
}).then(nc => {
  console.log('NocoDB middleware:', nc);
  // Use NocoDB as middleware in your Koa application
  nocodbWebServer.use(convert(nc));

  // Start the Koa server on a specified port
  nocodbWebServer.listen(3330, () => {
    console.log('NocoDBServer is running on http://127.0.0.1:3330');
  });
}).catch(err => {
  console.error('Failed to initialize NocoDB:', err);
});;
