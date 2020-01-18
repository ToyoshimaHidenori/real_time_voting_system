var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;
const jquery = require('jquery');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//routing
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);


// for voting(切り分けるべき)
var num_attending_user=30;
var num_accept=0;
var num_deny=0;
var is_voting=false;
var is_accepted=false;
var voter_name="準備中";
var user_names={};
var user_is_accepting=[];

function nextVoter() {
    is_voting=true;
    num_accept=0;
    num_deny=0;
    has_result=false;
    is_accepted=false;
    io.emit('num_accept', num_accept);
    io.emit('num_deny', num_deny);
}


//socket.io(file切り分けるべき)
io.on('connection',function(socket){
  console.log(socket.id+':connected');

  socket.on('message',function(msg){
      io.emit('message', msg);
  });

  socket.on('num_attendees',function(num_attendees){      
      num_attending_user=num_attendees;
      io.emit('num_attendees', num_attending_user);
      console.log('出席数は ' + num_attending_user);
  });

  socket.on('vote',function(vote){
      console.log('vote: ' + vote);
      const vote_info = vote.split(",");
      if(vote_info[0]=='accept'){
          user_is_accepting[vote_info[1]]=true;
          num_accept++;
          if(num_accept>(num_attending_user*2/3)){
              console.log('accepted');
              var is_accepted=true;
              io.emit('is_accepted',is_accepted);
          }
      }else{
          num_deny++;
          user_is_accepting[vote_info[1]]=false;
          if(num_deny>(num_attending_user*1/3)){
              console.log('deny');
              var is_accepted=false;
              io.emit('is_accepted',is_accepted);
          }
      }
      io.emit('num_accept', num_accept);
      io.emit('num_deny', num_deny);
  });

  socket.on('user_info',function(usrinf){
      console.log('userinf: ' + usrinf);
  });

  socket.on('voter',function(vtr){
    voter_name=vtr;
    nextVoter();
    console.log('now voted: ' + voter_name);
    io.emit('voter', voter_name);
  });
});


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

http.listen(PORT, function(){
  console.log('server listening. Port:' + PORT);
});
module.exports = app;
