var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 웹소켓 
var server = require('http').createServer(app); //웹 소켓을 위한 새로운 서버를 만든다.

//웹소켓 서버는 3001번에서 listening하고 있다.
server.listen(3001, function(){
  console.log('socket io server listening on port 3001');
})

//socket연결 및 on, event행동정보가 담긴 socket.js모듈을 불러온다.
//socket.js모듈은 웹서버를 파라미터로 받는 함수이다.
require('./socket.js')(server); // 웹소켓 함수 실행

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tempRouter = require('./routes/temp');

// 몽고디비 : ./schemas/index.js의 module.exports로 내보낸 함수 실행
var connect = require('./schemas');

var cors = require('cors') //cors설정

var app = express();

// 몽고디비: express객체 생긴 후 몽고디비 연결
connect();

//웹소켓통신을 위해서는 쌍방 cors설정이 되어야한다.
//클라이언트의 주소를 허용한다.
var corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true };

app.use(cors(corsOptions));
// app.use(cors()) //cors use


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/temp', tempRouter);

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
