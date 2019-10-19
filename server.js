const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const smSocket = require('./server/scrum-socket');

const log4js = require('log4js');
log4js.configure('./config/log4js.json');
const LOG = log4js.getLogger('server');

app.use(static('public'));
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (ctx, next) => {
    await next();
    const status = ctx.status;
    if(status === 404)
        await ctx.render('404');
})

render(app, { root: './views', layout: false, cache: false });
router.get('/', async (ctx) => { await ctx.render('index') });
router.get('/calendar/:key', smSocket.loadCalendar);

server.listen(8080);
io.on('connection', smSocket.socketHandler);
io.on('error', (error) => { LOG.error('error', error) });

LOG.info('scrum portal start...');