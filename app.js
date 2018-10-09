const Koa = require('koa')
const koaRouter = require('koa-router')
const json = require('koa-json')

const path = require('path')
const serve = require('koa-static')
const historyApiFallback = require('koa2-history-api-fallback')

const koaBodyparser = require('koa-bodyparser')
const routesObj = require('./server/routes.js')

const app = new Koa()
const router = koaRouter()

app.use(koaBodyparser())
app.use(json())

const fs = require('fs')

function writeLog (data) {
  fs.appendFile('./log.txt', data, 'utf8', e => {
  })
}

app.use(async (ctx, next) => {
  const start = new Date()
  const result = await routesObj.verify(ctx)
  if (typeof result === 'object') {
    ctx.state.userInfo = result
    await next()
  } else {
    writeLog('【' + result + '】')
    ctx.body = {
      success: false,
      data: {},
      message: result
    }
  }
  const ms = new Date() - start
  writeLog(ctx.method + ' ' + ctx.url + ' ' + ms + 'ms \r\n')
  console.log('%s %s - %s', ctx.method, ctx.url, ms)
})

app.on('error', function (err, ctx) {
  writeLog('server error' + err + '\n' + JSON.stringify(ctx) + '\r\n')
  ctx.body = {
    success: false,
    data: ctx,
    message: err
  }
  console.log('server error', err)
})

router.use('/api', routesObj.routes.routes())

app.use(router.routes())
app.use(historyApiFallback())
app.use(serve(path.resolve('dist')))

app.listen(3001, () => {
  console.log('Koa is listening in 3001')
})

module.exports = app
