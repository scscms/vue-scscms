/*
* 前言：其实直接在服务器里使用npm命令即可实现发布，但是比较麻烦。因为服务器经常会重启，需要反复启用npm命令。而使用node-windows可以实现windows服务，以后再也不用担心服务器重启，项目会自动开机重启。
* 使用方法：事先要打包好静态文件，然后先安装模块
* $ npm install node-windows
* 然后建立本文件，使用npm命令定位到本文件位置执行命令
* $ node NW.js
* 然后就可访问网站http://服务器ip:3001/ 或 http://localhost:3001/（限服务器内访问）
* 说明：反复执行node NW.js可实现注册和卸载服务。注册成功后会生成daemon目录。注意如果有杀毒软件需要允许放行。
* */
const name = 'NodeScscms';
let Service = require('node-windows').Service;
let EventLogger = require('node-windows').EventLogger;
let log = new EventLogger(name);
let svc = new Service({
  name,//服务名称
  description: 'vue-scscms',
  script: require('path').join(__dirname,'server-entry.js'),
  wait: 2,//程序重启的时间间隔
  grow: .5, //程序重启的时间增长值
  maxRetries: 40 //60秒内最大重启次数
});

svc.on('install',function(){
  svc.start();
  log.info('install complete.');
});

svc.on('uninstall',function(){
  log.info('Uninstall complete.');
  log.warn('The service exists: ',svc.exists);
});

svc.on('alreadyinstalled',()=>{
  log.error('This service is already installed.');
});

if(svc.exists){
  svc.uninstall();//卸载服务
  console.log('已经卸载服务')
}else{
  svc.install();//注册服务
  console.log('已经注册服务')
}
