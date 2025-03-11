const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./api/routes');

const app = new Koa();

// Middleware
app.use(bodyParser());

// Routes
app.use(router.routes());
app.use(router.allowedMethods());


app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on all the interfaces port 3000');
});

module.exports = app;

