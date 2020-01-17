var socketio = io();
var num_attending_user=30;
var is_voting=false;
var num_accept=0;
var num_deny=0;
$(function(){

    $('#num_of_attendees_form').submit(function(){
      socketio.emit('num_attendees', $('#input_attendees_num').val());
      num_attending_user=$('#input_attendees_num').val();
      $('#bar_accept').attr({
        'aria-valuenow': num_accpt,
        'aria-valuemax': num_attending_user
      });
      $('#input_attendees_num').val('');
      return false;
    });
    $('#voters_form').submit(function(){
      socketio.emit('voter', $('#input_voter').val());
      $('#input_voter').val('');
      return false;
    });

    socketio.on('is_accepted',function(is_accptd){
        if(is_accptd){
          $('#is_accptd').text('承認されました');
        }else{
          $('#is_accptd').text('否認されました');
        }
        return false;
    });

    socketio.on('num_accept',function(num_accpt){
      num_accept=num_accpt;
      $('#num_accept').text(num_accpt);
      $('#bar_accept').attr({
        'aria-valuenow': num_accpt,
        'aria-valuemax': num_attending_user
      });
      return false;
    });
    socketio.on('num_deny',function(num_dny){
      num_deny=num_dny;
      $('#num_deny').text(num_deny);
      return false;
    });

    socketio.on('message',function(msg){
      $('#messages').append($('<li>').text(msg));
        return false;
    });
    socketio.on('voter',function(vtr){
      $('#voter').text("現在の発表者は"+vtr);
      $('#is_accptd').text('投票中です');
      is_voting=true;
      voter_name=vtr;
      num_accept=0;
      num_deny=0;
      $('#num_accpt').text(num_accept);
      $('#num_deny').text(num_deny);
      $('#bar_accept').attr({
        'aria-valuenow': num_accpt,
        'aria-valuemax': num_attending_user
      });
      is_accepted=false;
    });
    return false;
  });