//https://molunerfinn.com/Vue+Koa/
import Koa from 'koa';
import koa_router from "koa-router";
import json from 'koa-json';
import logger from 'koa-logger';

import path from 'path';
import serve from 'koa-static';
import historyApiFallback from 'koa2-history-api-fallback';

import koa_bodyparser from "koa-bodyparser";
import routes_obj from './server/routes.js';

const app = new Koa();
const router = koa_router();

app.use(koa_bodyparser());
app.use(json());
app.use(logger());

const fs = require('fs');
function writeLog(data){
    fs.appendFile('./log.txt',data,'utf8',e=>{});
}

app.use(async (ctx, next)=>{
	const start = new Date;
	const result = await routes_obj.verify(ctx);
	if(typeof result === "object"){
        ctx.state.userInfo = result;//存储用户信息
		await next();
	}else{
		writeLog('【' + result + '】');
		ctx.body = {
            success: false,
			data:{},
            message: result
        }
	}
    const ms = new Date - start;
    writeLog(ctx.method + ' ' + ctx.url + ' ' + ms + 'ms \r\n');
    console.log('%s %s - %s', ctx.method, ctx.url, ms);
});

app.on('error', function (err, ctx) {
    writeLog('server error' + err + '\n' + JSON.stringify(ctx) + '\r\n');
    ctx.body = {
        success: false,
        data:ctx,
        message: err
    };
    console.log('server error', err);
});

router.use('/api', routes_obj.routes.routes());

app.use(router.routes()); // 将路由规则挂载到Koa上。
app.use(historyApiFallback());
app.use(serve(path.resolve('dist'))); // 将webpack打包好的项目目录作为Koa静态文件服务的目录

app.listen(3001, () => {
    console.log('Koa is listening in 3001');
});

export default app;
