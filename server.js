var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;
const jquery = require('jquery');

// for voting
var num_attending_user=30;
var num_accept=0;
var num_deny=0;
var is_voting=false;
var is_accepted=false;
var voter_name="準備中";
var user_names={};
var user_is_accepting=[];

app.get('/' , function(req, res){
    res.sendFile(__dirname+'/index.html');
});

app.get('/admin/' , function(req, res){
    res.sendFile(__dirname+'/admin.html');
});

io.on('connection',function(socket){
    console.log('connected');
    socket.on('message',function(msg){
        console.log('message: ' + msg);
        io.emit('message', msg);
    });
    socket.on('num_attendees',function(num_attendees){      
        num_attending_user=num_attendees;
        io.emit('message', num_attending_user);
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
        is_voting=true;
        voter_name=vtr;
        num_accept=0;
        num_deny=0;
        is_accepted=false;
        console.log('now voted: ' + voter_name);
        io.emit('voter', voter_name);
    });
    
});
http.listen(PORT, function(){
    console.log('server listening. Port:' + PORT);
});