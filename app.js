var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https'); //ssl
const fs = require('fs'); //ssl
var categoryRouter = require('./routes/category');
var groupRouter = require('./routes/group');
var indexRouter = require('./routes/index');
var itemRouter = require('./routes/item');
var usersRouter = require('./routes/users');
var dummyRouter = require('./routes/dummy');
var followRouter = require('./routes/follow');
var uploadRouter = require('./routes/upload');
var notiRouter = require('./routes/notification');
// 몽고디비 : ./schemas/index.js의 module.exports로 내보낸 함수 실행
var connect = require('./schemas');

require('dotenv').config();

var cors = require('cors') //cors설정

var app = express();

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/wish.codeplot.co.kr/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/wish.codeplot.co.kr/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/wish.codeplot.co.kr/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

// 몽고디비: express객체 생긴 후 몽고디비 연결
connect();

//웹소켓통신을 위해서는 쌍방 cors설정이 되어야한다.
//클라이언트의 주소를 허용한다. 서버의 주소를 허용하는 헤더를 붙여 보낸다.
app.use(cors()) //cors use

var targetPath = '/.well-known/acme-challenge/PCJCGSrGk2z9l9z6bOD0wiEJDDT-7_Do_b0q56YUzrw';
var returnValue = 'PCJCGSrGk2z9l9z6bOD0wiEJDDT-7_Do_b0q56YUzrw.YK-nj0Rj5X_HLRTP1xL5domWVq8iAw-TwAXZ6TtFqAQ';

app.get(targetPath, function(req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(returnValue);
})
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  return next();
});


// 웹소켓 
var ws_server = require('https').createServer(credentials, app); //웹 소켓을 위한 새로운 서버를 만든다.

//웹소켓 서버는 3001번에서 listening하고 있다.
ws_server.listen(3001, function(){
  console.log('3001번 웹소켓 서버생성');
})

//socket연결 및 on, event행동정보가 담긴 socket.js모듈을 불러온다.
//socket.js모듈은 웹서버를 파라미터로 받는 함수이고, 바로 호출된다.

//현재 연결중인 클라이언트들을 담을 배열을 생성한다.
let connectedClients = {}; 
require('./socket')(ws_server, connectedClients);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', express.static(path.join(__dirname, 'public/dist')));

app.use('/category', categoryRouter);
app.use('/group', groupRouter);
app.use('/item', itemRouter);
app.use('/users', usersRouter);
app.use('/test', dummyRouter);
app.use('/follow', followRouter);
app.use('/upload', uploadRouter);
app.use('/noti', notiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
