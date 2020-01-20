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
var has_result=false;
var voter_name="準備中";
var event_name="承認会議";
var user_names={};
var user_is_accepting=[];
var user_status={};

//api for init
app.get('/api/v1/init/',function(req,res){
  res.json({
      "init_num_voter": num_attending_user,
      "init_num_accept": num_accept,
      "init_num_deny": num_deny,
      "init_voter_name": voter_name,
      "init_has_result":  has_result,
      "init_is_voting": is_voting,
      "init_is_accepted": is_accepted,
      "init_event_name": event_name
  });
});


function auth(user_id){
  if(((user_id%13===0)&&(user_id>=10000)&&(user_id<=99999))||user_id===-3){
    return true;
  }else{
    return false;
  }
}

//api for login
app.get('/api/v1/status/:id',function(req,res){
  if(user_status[req.params.id]){
    res.json({"status" : user_status[req.params.id]});
  }else if(auth(req.params.id)){
    user_status[req.params.id] = "ready";
    res.json({"status" : user_status[req.params.id]});
  }else{
    res.json({"status" : "rejected"});
  }
});

app.get('/api/v1/status_all/',function(req,res){
  res.json(user_status);
});

app.get('/api/v1/user_name/all/',function(req,res){
  res.json(user_names);
});




function setUserStatusReady(){
  const keys = Object.keys(user_status);
  for (let i = 0; i < keys.length; i++) {
    if (user_status[keys[i]] === 'voted_accept') {
      user_status[keys[i]]='ready';
    }else if(user_status[keys[i]] === 'voted_deny'){
      user_status[keys[i]]='ready';
    }
  }
}

function new_event(){
    is_voting=false;
    num_accept=0;
    num_deny=0;
    has_result=false;
    is_accepted=false;
    voter_name="準備中";
    user_names={};
    user_status={};
    io.emit('new_event', event_name);
}

function nextVoter() {
    is_voting=true;
    num_accept=0;
    num_deny=0;
    has_result=false;
    is_accepted=false;
    io.emit('num_accept', num_accept);
    io.emit('num_deny', num_deny);
    setUserStatusReady();
}


//socket.io(file切り分けるべき)
io.on('connection',function(socket){
  console.log(socket.id+':connected');

  socket.on('message',function(msg){
      io.emit('message', msg);
  });

  socket.on('new_event',function(new_event_name){
      event_name=new_event_name;
      new_event();
  });

  socket.on('num_attendees',function(num_attendees){      
      num_attending_user=num_attendees;
      io.emit('num_voter', num_attending_user);
      console.log('出席数は ' + num_attending_user);
  });

  socket.on('vote',function(vote, user_id){
      if(user_status[user_id]==='ready'){
        if(vote=='accept'){
          user_status[user_id]='voted_accept';
          user_is_accepting[user_id]=true;
          num_accept++;
          if(num_accept>=(num_attending_user*2/3)){
              console.log('accepted');
              is_accepted=true;
              has_result=true;
              io.emit('is_accepted',is_accepted);
          }
        }else{
          num_deny++;
          user_is_accepting[user_id]=false;
          user_status[user_id]='voted_deny';
          if(num_deny>(num_attending_user*1/3)){
              console.log('deny');
              is_accepted=false;
              has_result=true;
              io.emit('is_accepted',is_accepted);
          }
        } 
      io.emit('num_accept', num_accept);
      io.emit('num_deny', num_deny);
      console.log(user_id+':vote: ' + vote);
      }else{
        console.log(user_id+':vote: ' + vote + 'rejected');
      }
  });

  socket.on('user_info',function(usrinf){
      console.log('userinf: ' + usrinf);
  });

  socket.on('login',function(id,name){
    if(auth(id)){
      console.log(id+':success login: ' + name);
      io.emit('login_success',id);
      if(user_status[id]){

      }else{
        user_status[id] = "ready";
      }
      user_names[id] = name;
    }else{
      console.log(id+':failed login: ' + name);
      io.emit('login_failed',id);
    }
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
