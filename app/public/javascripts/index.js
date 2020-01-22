var socketio = io();
//user info
var user_name="匿名";
var user_id=-1;
var user_password="";
var is_login_user=false;

//event info
var event_name="投票システム";

//voter info
var voter_name="匿名団体";
var num_attending_user=30;

//voting info
var num_accept=0;
var num_deny=0;
var is_accepted=false;
var has_result=false;
var is_voting=false;
var user_status="";

//cookie info
document.cookie = 'user_id=0';
document.cookie = 'user_name=匿名団体';


function userStatus(input_user_id){
// function getUserStatus(input_user_id){
  var requestst = new XMLHttpRequest();
  requestst.open('GET', '/api/v1/status/'+input_user_id, false);
  requestst.onload = function () {
    var datastr = this.response;
    var data=JSON.parse(datastr);
    user_status=data.status;
  };
  requestst.send();
  return user_status;
}



  // $.ajax({
  //   type: "GET",
  //   url: "/api/v1/status/"+input_user_id,
  //   dataType:"json",
  //   timespan:1000, 		// 通信のタイムアウトの設定(ミリ秒)
  //   async   : true,
  //   success : function(result) {
  //     //成功時の処理
  //     return result["state"];
  //   }
    // }
		// // 2. doneは、通信に成功した時に実行される
		// //  引数のdata1は、通信で取得したデータ
		// //  引数のtextStatusは、通信結果のステータス
		// //  引数のjqXHRは、XMLHttpRequestオブジェクト
		// }).done(function(data1,textStatus,jqXHR) {
		// 		user_status=data1["status"];
    //     return "aaa"

		// // 6. failは、通信に失敗した時に実行される
		// }).fail(function(jqXHR, textStatus, errorThrown ) {
		// 		return "ffff"

		// // 7. alwaysは、成功/失敗に関わらず実行される
		// }).always(function(){

				
	// });
  // getUserStatus(input_user_id);
  // return user_status;
// }



function setAcceptCard(){
  $('#ballot_card').remove();
  $('#card-case').html('<div id="ballot_card" class="card border-success mb-3 ml-3 mr-3 mt-3 shadow-lg "><div class="card-body text-success"><h5 class="card-title">To '+voter_name+'</h5><p class="text-center card-text">承認します。</p><p class="text-right card-text">From '+user_name+'</p></div></div>');
}

function setDenyCard(){
  $('#ballot_card').remove();
  $('#card-case').html('<div id="ballot_card" class="card border-danger mb-3 ml-3 mr-3 mt-3 shadow-lg "><div class="card-body text-danger"><h5 class="card-title">To '+voter_name+'</h5><p class="text-center card-text">否認します。</p><p class="text-right card-text">From '+user_name+'</p></div></div>');
}

function alert(msg) {
    return $('<div class="alert" role="alert"></div>')
        .text(msg);
}

// アラート要素(Closeボタン付き)を生成する 
function alertWithCloseBtn(msg) {
return alert(msg)
    .addClass('alert-success alert-dismissable')
    .append(
    $('<button class="close" data-dismiss="alert"></button>')
        .append(
        $('<span aria-hidden="true">☓</span>')
        )
    );
}



function rewriteResult() {
  $('#is_accptd').removeClass("text-success");
  $('#is_accptd').removeClass("text-danger");
  if(has_result){
    if(is_accepted){
      $('#is_accptd').text('承認されました');
      $('#is_accptd').addClass("text-success");
    }else{
      $('#is_accptd').text('否認されました');
      $('#is_accptd').addClass("text-danger");
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

function rewriteCard(){
  
  
  if($("input[name='votes']:checked").val()=='accept'){
    setAcceptCard();
    $('#option1l').removeClass('active');
    $('#option1').prop('checked', false);
  }else{
    setDenyCard();
    $('#option2l').removeClass('active');
    $('#option2').prop('checked', false);
  }
}

function writeCardBlur(){
  $('#disable_text').addClass("disable_text");
  $('#disable_textp').text("投票する場合は、団体を登録してください");
  $('#disable_box').addClass("disable_box");
}

function removeCardBlur(){
  $('#disable_text').removeClass("disable_text");
  $('#disable_textp').text("");
  $('#disable_box').removeClass("disable_box");
}

function rewriteCardAvalability(){
  if(userStatus(user_id)=='rejected'){
    writeCardBlur();
    $('#vote_submit').prop('disabled', true);
  }else{
    removeCardBlur();
    if(userStatus(user_id)=='ready'){
      if(is_voting){
        $('#vote_submit').prop('disabled', false);
      }else{
        $('#vote_submit').prop('disabled', true);
      }
    }else{
      $('#vote_submit').prop('disabled', true);
    }
  }
}


function rewriteGraph() {
  $('#num_accpt').text(num_accept);
  $('#num_deny').text(num_deny);
  $('#bar_accept').attr({
    'aria-valuenow': num_accept,
    'aria-valuemax': num_attending_user,
    'style': "width: "+num_accept*100.0/num_attending_user+"%"
  });
  $('#bar_accept').text("承認: "+num_accept);

  $('#bar_blank').attr({
    'aria-valuenow': num_accept,
    'aria-valuemax': num_attending_user,
    'style': "width: "+(num_attending_user-num_accept-num_deny)*100.0/num_attending_user+"%"
  });
  $('#bar_blank').text("未投票: "+(num_attending_user-num_accept-num_deny));

  $('#bar_deny').attr({
    'aria-valuenow': num_deny,
    'aria-valuemax': num_attending_user,
    'style': "width: "+num_deny*100.0/num_attending_user+"%"
  });
  $('#bar_deny').text("否認: "+num_deny);

  rewriteResult();
  return false;
}

function rewritePreference(){
  if(is_voting){
    $('#voter').text("現在の発表者は"+voter_name); 
  }else{
    $('#voter').text("しばらくお待ちください…"); 
  }
  
  rewriteCard();
}

function rewrite() {
  rewriteCardAvalability();
  rewriteResult();
  rewriteGraph();
  rewritePreference();
}

function init() {
  $('#shutter1').html('<h1 class="shutter text-nowrap shuttertext" shutter_content="ようこそ、'+event_name+'へ"></h1>');
  setTimeout(function(){
    $('.modal').modal('show');
  },2000);
//   $(window).on('touchmove.noScroll', function(e) {
//     e.preventDefault();
//   });

  var request = new XMLHttpRequest();
  request.open('GET', '/api/v1/init/', true);
  request.responseType = 'json';
  request.onload = function () {
    var data = this.response;
    num_attending_user=data.init_num_voter;
    num_accept=data.init_num_accept;
    num_deny= data.init_num_deny;
    voter_name= data.init_voter_name;
    has_result=data.init_has_result;
    is_voting = data.init_is_voting;
    is_accepted=data.init_is_accepted;
    event_name=data.init_event_name;
    rewrite();
  };
  request.send();
}

function login() {
  socketio.emit('user_info', $('#user_id').val()+","+$('#user_name_input').val());
  socketio.emit('login', $('#user_id').val(),$('#user_name_input').val());
  user_id=$('#user_id').val();
  user_name=$('#user_name_input').val();

  // modalを閉じる
  $('body').removeClass('modal-open'); // 1
  $('.modal-backdrop').remove();       // 2
  $('#input_user_info').modal('hide'); 

  
  if(userStatus(user_id)!='rejected'){
     // アラートを表示して、一定時間経過後消去する。
    const e = alertWithCloseBtn(user_name+'として登録が完了しました！ 入力ありがとうございます。').addClass('alert-success');
    $('#alert-1').append(e);
    setTimeout(() => {
        e.alert('close');
    }, 5000);
    is_login_user=true;
  }else{
     
    const e = alertWithCloseBtn(user_name+'として登録が失敗しました。正しい団体番号を入力して下さい。 ').addClass('alert-warning');
    $('#alert-1').append(e);
    setTimeout(() => {
        e.alert('close');
    }, 5000);
    is_login_user=false;
  }
  rewrite();
  return true;
}


function vote() {
  socketio.emit('vote', $("input[name='votes']:checked").val(),user_id);
  $('#vote_submit').prop('disabled', true);
  const e = alertWithCloseBtn(voter_name+'への投票を送信しました。').addClass('alert-primary');
  $('#alert-1').append(e);
  setTimeout(() => {
      e.alert('close');
  }, 5000);
  return false;
}

function nextVoter() {
  $('#vote_submit').prop('disabled', false);
  num_accept=0;
  num_deny=0;
  has_result=false;
  is_accepted=false;
  is_voting=true;
  $('.shutter').remove();
  $('#shutter1').html('<h1 class="shutter shuttertext text-nowrap" shutter_content="'+voter_name+'"></h1>');
  rewrite();
}



$(document).ready(function(){
  init();
  return false;
});

$(function(){
  $('#ballot_form').submit(function(){
    vote();
    return false;
  });

  $('#user_info_form').submit(function(){
    login();
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
  socketio.on('num_voter',function(num_vtr){
    num_attending_user=num_vtr;
    rewrite();
    return false;
  });

  //event情報更新を実装する
  socketio.on('new_event',function(event){
    event_name=event;
    init();
    return false;
  });



// デバッグ用メッセージ機能
  $('#message_form').submit(function(){
    socketio.emit('message', user_name+": "+$('#input_msg').val());
    $('#input_msg').val('');
    return false;
  });

  socketio.on('message',function(msg){
    $('#messages').append($('<li>').text(msg));
    return false;
  });
});
