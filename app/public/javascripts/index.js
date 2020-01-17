var socketio = io();
            var user_name="匿名団体";
            var voter_name="匿名団体";
            var user_id=0;
            var num_attending_user=30;
            var num_accept=0;
            var num_deny=0;
            document.cookie = 'user_id=0';
            document.cookie = 'user_name=匿名団体';
            $(document).ready(function(){
                $('.modal').modal('show');
            });
            
            function alert(msg) {
                return $('<div class="alert" role="alert"></div>')
                    .text(msg);
            }
            /**
             * アラート要素(Closeボタン付き)を生成する
             */
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


            $(function(){
              $('#ballot_form').submit(function(){
                socketio.emit('vote', $("input[name='votes']:checked").val()+","+user_id);
                $('#vote_submit').prop('disabled', true);
                const e = alert(voter_name+'への投票を送信しました。').addClass('alert-primary');
                $('#alert-1').append(e);
                setTimeout(() => {
                    e.alert('close');
                }, 5000);
                return false;
              });
              $('#user_info_form').submit(function(){
                socketio.emit('user_info', $('#user_id').val()+","+$('#user_name_input').val());
                user_id=$('#user_id').val();
                user_name=$('#user_name_input').val();

                // modalを閉じる
                $('body').removeClass('modal-open'); // 1
                $('.modal-backdrop').remove();       // 2
                $('#input_user_info').modal('hide'); 

                // アラートを表示して、一定時間経過後消去する。
                const e = alert(user_name+'として登録が完了しました！ 入力ありがとうございます。').addClass('alert-success');
                $('#alert-1').append(e);
                setTimeout(() => {
                    e.alert('close');
                }, 5000);

                $('#user_id').val('');
                return false;
                $('#input_name_input').val('');
                return false;
              });
            //   $('#user_info_form').submit(function(){
            //     user_id=$('#user_id').val();
            //     socketio.emit('user_id', $('#user_id').val());
            //     $('#user_id').val('');
            //     return false;
            //   });
              $('#message_form').submit(function(){
                socketio.emit('message', $('#input_msg').val());
                $('#input_msg').val('');
                return false;
              });
              socketio.on('message',function(msg){
                $('#messages').append($('<li>').text(msg));
              });

              socketio.on('is_accepted',function(is_accptd){
                  if(is_accptd){
                    $('#is_accptd').text('承認されました');
                  }else{
                    $('#is_accptd').text('否認されました');
                  }
              });
              socketio.on('voter',function(vtr){
                $('#messages').append($('<li>').text(vtr));
                $('#voter').text("現在の発表者は"+vtr);
                $('#vote_submit').prop('disabled', false);
                $('#is_accptd').text('投票中...');
                voter_name=vtr;
              });
            });
