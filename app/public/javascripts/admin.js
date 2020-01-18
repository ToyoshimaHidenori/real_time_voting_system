var socketio = io();

//user info
var user_name="匿名";
var user_id=-1;
var user_password="";
var is_login_user=false;

//event info
var event_name="承認会議";

//voter info
var voter_name="匿名団体";
var num_attending_user=30;

//voting info
var num_accept=0;
var num_deny=0;
var is_accepted=false;
var has_result=false;
var is_voting=false;

function rewriteResult() {
  if(has_result){
    if(is_accepted){
      $('#is_accptd').text('承認されました');
    }else{
      $('#is_accptd').text('否認されました');
    }
  }else{
    if(is_voting){
      $('#is_accptd').text('投票中...');
    }else{
      $('#is_accptd').text('');
    }
  }
  return false;
}

function rewriteGraph(){
  $('#num_accept').text(num_accept);
  $('#num_deny').text(num_deny);
  $('#bar_accept').attr({
    'aria-valuenow': num_accept,
    'aria-valuemax': num_attending_user,
    'style': "width: "+num_accept*100/num_attending_user+"%"
  });
  rewriteResult();
}

function rewritePreference(){
  $('#voter').text("現在の発表者は"+voter_name); 
}

function rewrite() {
  rewriteResult();
  rewriteGraph();
  rewritePreference();
}

function init() {

}

function login() {
  
}

function nextVoter() {
  is_voting=true;
  num_accept=0;
  num_deny=0;
  has_result=false;
  is_accepted=false;
  rewrite();
}


function sendNextVoter() {
  socketio.emit('voter', $('#input_voter').val());
  $('#input_voter').val('');
}

function snedNumOfAttendees() {
  num_attending_user=$('#input_attendees_num').val();
  $('#input_attendees_num').val('');
  socketio.emit('num_attendees', num_attending_user);
}

function snedPreference() {

}

function snedAllowedUserInfo() {
  
}

$(document).ready(function(){
  init();
  return false;
});

$(function(){
  $('#num_of_attendees_form').submit(function(){
    snedNumOfAttendees();
    rewrite();
    return false;
  });

  $('#voters_form').submit(function(){
    sendNextVoter();
    return false;
  });

  socketio.on('is_accepted',function(is_accptd){
    is_accepted=is_accptd;
    has_result=true;
    rewriteResult();
    return false;
  });

  socketio.on('num_accept',function(num_accpt){
    num_accept=num_accpt;
    rewriteGraph();
    return false;
  });

  socketio.on('num_deny',function(num_dny){
    num_deny=num_dny;
    rewriteGraph();
    return false;
  });

  socketio.on('voter',function(vtr){
    voter_name=vtr;
    nextVoter();
    return false;
  });

  //デバッグ用メッセージ機能
  socketio.on('message',function(msg){
    $('#messages').append($('<li>').text(msg));
      return false;
  });

});