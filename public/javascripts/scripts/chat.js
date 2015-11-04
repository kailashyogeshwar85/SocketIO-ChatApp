//client side javascript
//loading socket client at cliend side,it expose io global & connect 
        //no url specified since it servers the current host that serves the page
        var socket = io();
        var messages=[];
        var myUserName;
        var currentUser;
        var currentSid;
        var usersList=[];
        var boxes=[];//keeping track of the boxes
        var boxlength;
        var colors = ["#ff3322", "blue", "orange", "purple", "yellow"];
        emojify.setConfig({img_dir:'emoji/images/emoji'});

    $(function(){
         // enableMsgInput(false);
         setUsername();
        //when client types & submits msg server  get a 'chat message' event
        $('form#tweetFrm').on('submit',function(){
            socket.emit('chat message',$('#tweet-input').val());
            $('#tweet-input').val('');
            return false;//preventing form to be submitted
        });

        //listen for chat message event
        socket.on('broadcast message',function(data){
            
            // postMessage(data);
            messages=[];//flush out previous contents
            var msg=data.msg;
            var time=formatDate(new Date());
            var user=data.username;

            messages.push(data);
            
            var uniqueid=new Date().getTime().toString();
            for(var i=0;i<messages.length;i++)
            {
             console.log('in broadcast');  
            var $li       =  $('<li/>');//1st
            var $msgWrap  =  $('<div/>',{class:'msg-wrap'});//2 
            var $avatarDiv=  $('<div/>',{class:'avatar'});
            var $avatar   =  $('<img/>',{src:'../images/default.png'});//3
            var $msgCont  =  $('<div/>',{class:'msg-content'});
            var $userInfo =  $('<p/>');
            var $chatUser =  $('<strong>',{class:'chat-user',style:"color:"+colors[Math.floor(Math.random() * colors.length)],text:user});
            var $time     =  $('<span>',{class:'post-time',text:time});
            var $msgBody  =  $('<div/>',{class:'msg-body'});//to hold message
            var $msg      =  $('<span/>',{id:uniqueid,text : messages[i].msg});//actual msg

            $avatarDiv.append($avatar);
            $li.addClass('list-group-item');
            $userInfo.append($chatUser).append($time);
            $msgBody.append($msg);

            //appending to msgCont div
            $msgCont.append($userInfo).append($msgBody);

            //appending to msgWrap div
            $msgWrap.append($avatarDiv).append($msgCont);
            $li.append($msgWrap);
            $('#messages').append($li.fadeIn(500,function(){
              
            }));
 
          }
         emojify.run(document.getElementById(uniqueid));
        });
    //user joinedd message to all
    socket.on('user joined',function(userdata)
    {
         
         // getDestinationId(usersList);
         console.log('in user joined');
          usersList=userdata.socketids;
         showNotification(userdata,"neighbour");
        //getOnlineUsers(userdata);
         addUserToList(userdata.username);
    });

    //welcome msg
    socket.on('welcome',function(data){
        console.log('current socket id'+socket.id);
        console.log('welcome message received');
        console.log(data);
        usersList=data.socketids;
        currentUser=data.username;
        showNotification(data,"welcome");
        getOnlineUsers(data);//list of online users        
        //addUserToList(data.username);//add current user
        enableMsgInput(true);
    });
    //on offline
    socket.on('user left',function(data){
        console.log(data);
        showNotification(data,"disconnected");
        getOnlineUsers(data);
    });
    //personal message
    socket.on('private message',function(data){
        postPrivateMessage(data);
    });

    $('.list-group').on('click','li',function(){
                
             var user=$(this).find('span').html();
             var uid=getDestinationId(user);//get uid
             console.log(uid);
             if(user===currentUser)
             {
                return;
             }
             createChatBox(user,uid);//wrong adds current user sid not end users
                 
        });

    $('body').on('keypress','.chat-input textarea',function(evt){
        
        if(evt.keyCode==13)
        {
            var txtId=$(this).data('sid');
            var msg=$(this).val();         
            socket.emit('private message',{
                                        'message':msg,
                                        'receiverid':txtId,
                                        'senderid':socket.id
                                        });
            var receiver=getDestinationName(txtId,usersList);
            addToChatBox(msg,receiver);
            $(this).val('');
        }
    });
    $('body').on('focus','.chat-input textarea',function(){
             var $divs=$(this).parent().siblings();
             $divs.each(function(idx,value){
                if($(this).hasClass('blink'))
                {
                  $(this).removeClass('blink');
                }
             });
    });
  });//doc ready

function setUsername()
{
    myUserName=$('.live-username span').html();
    console.log("username "+myUserName);
    socket.emit('set user',$.trim(myUserName),function(data){
        console.log('emit set username ',data);
            
    });
    // $('input#username').val('').hide();
 }

 //making user online
 function addUserToList(username)
 {
            console.log("making user online"+username);
            var $divWrap =$('<div/>',{class:'userslist-wrap'});
            var $iconDiv=$('<div/>',{class:'icon-wrap avatar'});
            var $userName=$('<div/>',{class:'live-username'});
            var span=$('<span/>',{text :username});

            var $li  = $('<li/>',{class:'list-group-item'});
            var $img = $('<img/>',{src:'../images/default.png'});

            $userName.append(span); 
            $iconDiv.append($img);
            $divWrap.append($iconDiv).append($userName);
            $li.append($divWrap);
            $('#users-list').append($li);
 }
 function enableMsgInput(enable)
 {
    $('#msgbox').prop('disabled',!enable);//if false negate i.e disable=true
 }

 function showNotification(userData,notifyType)
 {

    
    var $alertDiv,$msg;
    if(notifyType==="welcome")
    { 

        console.log("welcome type msg");
        $alertDiv=$('<div/>',{class:'welcome alert alert-success alert-dismissible'});
        $msg=$('<span/>',{text:" Welcome to Twiddle"});
    }
    else if(notifyType==='neighbour')
    {
        console.log('user joined notification');
        $alertDiv=$('<div/>',{class:'welcome alert alert-info alert-dismissible'});
        $msg=$('<span/>',{text:" has come online"});
    }
    else
    {
        console.log('user left');
        $alertDiv=$('<div/>',{class:'welcome alert alert-warning alert-dismissible'});
        $msg=$('<span/>',{ text:" has just gone offline!!"})
    }
            $btn=$('<button/>',{class:'close',type:'button'})
                                        .attr('role','alert')
                                        .attr('data-dismiss','alert')
                                        .attr('aria-label','close');
            $span=$('<span/>').attr('aria-hidden','true').html('&times;');
            $welcome=$('<strong/>').html(userData.username);
            
            $welcome.prependTo($msg);
            $alertDiv.append($btn.append($span)).append($msg);
            $alertDiv.prependTo($('body')).fadeIn(1000,function(){
                $(this).animate({
                    top:2

                },2000,function(){
                    $(this).fadeOut(1000);
                })
            });
 }
function getOnlineUsers(usersObj)
{
    $('#users-list').empty();
    console.log('in online current users');
    console.log(usersObj.currentUsers);
    var users=usersObj.currentUsers;
    
    for(var i=0;i<users.length;i++)
    {
        //getting all nline users
            var $divWrap =$('<div/>',{class:'userslist-wrap'});
            var $iconDiv=$('<div/>',{class:'icon-wrap avatar'});
            var $userName=$('<div/>',{class:'live-username'});
            var span=$('<span/>',{text : users[i]});

            var $li  = $('<li>',{class:'list-group-item'});
            var $img = $('<img>',{src:'../images/default.png'});

            $userName.append(span); 
            $iconDiv.append($img);
            $divWrap.append($iconDiv).append($userName);
            $li.append($divWrap);
            $('#users-list').append($li);
            
    }
    
    
}

function formatDate(rawDate)
{

    var months=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
    var time=rawDate;
    var day=time.getDate();//1-31
    var mon=time.getMonth();//1-12
    var year=time.getFullYear();//2015
    var hours=time.getHours();
    var mins=(time.getMinutes()<10?'0':'')+time.getMinutes();
    var date=day+" "+months[mon]+" "+year+" "+hours+":"+mins;
    return date;

}
//private chat windows opening modules

function minimize(chatboxTitle)
    {
        // console.log("$('#'"+chatboxTitle+'-chatwindow'+' .chat-content))');
            console.log("$(#"+chatboxTitle+"-chatwindow"+" .chat-content)");
        if($('#'+chatboxTitle+'-chatwindow'+' .chat-content').css('display')=='none')
        {

            console.log("in none");
            $('#'+chatboxTitle+'-chatwindow'+' .chat-content').css('display','block');
            $('#'+chatboxTitle+'-chatwindow'+' .chat-input').css('display','block');
        }
        else
        {
            $('#'+chatboxTitle+'-chatwindow'+' .chat-content').css('display','none');
            $('#'+chatboxTitle+'-chatwindow'+' .chat-input').css('display','none'); 
        }
    }
function closeChat(chatTitle)
{
  // $('#'+chatTitle+'-chatwindow').css('display','none');
  $('#'+chatTitle+'-chatwindow').remove();
   var index=boxes.indexOf(chatTitle);
   boxes.splice(index,1);
   restructureChatBoxes();
}

function restructureChatBoxes()
{
      align=0;

      for(x in boxes)
      {
            boxtitle=boxes[x];
            //if box is opened or minimized
            if($("#"+boxtitle+"-chatwindow").css('display')!='none')
            {
                  if(align==0)
                  {
                        $("#"+boxtitle+"-chatwindow").css('right','275px');
                  }
                  else
                  {
                        width=(align)*(225+6)+275;
                        $("#"+boxtitle+"-chatwindow").css({right:width+'px'});     
                  }
                  align++;

            }
            //handle reposition if it has property display as none
      }
}

function createChatBox(chatTitle,socketid,messagetype)
{                 
                  boxlength=0;
                  var vw=$(window).width();//not return units
                  var chatboxes=0;
                  
                  
                  var $divwrap=$('<div/>',{class:'personal-chat chat-popup'});
                  
                  //check if chat is already opened or closed or minz 
                  if($("#"+chatTitle+"-chatwindow").length>0){
                        if($("#"+chatTitle+"-chatwindow").css('display')=='none')
                        {
                              $("#"+chatTitle+"-chatwindow").css('display','block');
                              restructureChatBoxes();
                        }
                        console.log('already opened');      
                        $("#"+chatTitle+"-chatwindow .chat-input textarea").focus();
                        return;
                  }

                  
                  for(x in boxes)
                  {
                        //if it previously wasnt opened and closed
                        if($("#"+chatTitle+"-chatwindow").css('display')!='none')
                         {     
                              boxlength++;
                         }     
                  }
                  
                  if(boxlength==0)
                  {
                   $divwrap.css({width:'225px',bottom:0,right:'275px'});

                  }
                  else{

                        width=boxlength*(225+6)+275;
                        console.log('before'+width);
                        if(width>(vw-225))
                        {
                              console.log("viewport "+vw);
                              console.log("calculated"+width);
                              console.log("cant add more chat windows");
                              alert('cant add more chats');
                              return;
                        }
                        
                        $divwrap.css({width:'225px',bottom:0,right:width+'px'});
                  }//outer else
                  
                  boxes.push(chatTitle);//eg "a","b"

                  console.log('boxlength'+boxlength);

                  $divwrap.attr('id',chatTitle+'-chatwindow');
                  var $chathead;
                  if(messagetype==='private')
                  {
                   
                  $chathead=$('<div/>',{class:'chat-head blink'});
                  }
                  else{

                  $chathead=$('<div/>',{class:'chat-head'});
                  }
                  var $chatTitle=$('<div/>',{class:'chat-title'});

                  $chatTitle.append('<div>'+chatTitle+'</div>');
                  $chatOptions=$('<div/>',{class:'chat-options'});
                  
                  var $chatminimize=$('<a/>',{text:' - ',href:'#'});
                  var $chatclose=$('<a/>',{text:' x ',href:'#'});

                  $chatminimize.attr('onclick',"minimize('"+chatTitle+"')");
                  $chatclose.attr('onclick',"closeChat('"+chatTitle+"')");
                  $chatOptions.append($chatminimize).append($chatclose);
                  $chathead.append($chatTitle).append($chatOptions);

                  var $chatcontent=$('<div/>',{class:'chat-content'});
                  var $chatinput=$('<div/>',{class:'chat-input'});
                  var $input=$('<textarea/>',{class:'textarea'});

                  $input.attr('data-sid',socketid);//end users socket id
                  $input.attr('id','uid-'+socketid);//assign unique id
                $divwrap.append($chathead).append($chatcontent).append($chatinput.append($input));
                $('body').append($divwrap);
                if(messagetype==undefined)
                {
                  console.log('mesgtype ' +messagetype);
                  $('.chat-input textarea').focus();
                }
}

function postPrivateMessage(data)
{
    var senderName=data.senderid;//if a send open a at receivers side
    var tweet=data.message;
    var time=formatDate(new Date());
    var sendersId=getDestinationId(senderName);//socket id
    createChatBox(senderName,sendersId,"private");//at receivers side
    console.log('private message received');
    
    var $spanTime=$('<span/>',{text:time});
    var $msgContent=$('#'+senderName+'-chatwindow .chat-content');
    var $msgPost=$('<div/>',{class:'message-post right'});
    var $bubble=$('<div/>',{class:'speech-bubble'});
    var $bubblearrow=$('<div/>',{class:'arrow bottom'})
    var $senderName=$('<p/>',{class:'sender-name',text:senderName+' '});
    var $tweetSpan=$('<span/>',{class:'p-msg',text:tweet});

    $senderName.append($spanTime);
    $bubble.append($bubblearrow).append($tweetSpan);    
    $msgPost.append($senderName).append($bubble);
    $msgContent.append($msgPost);
    var height=0;
    var childs=$msgContent.children();

    $(childs).each(function(idx,val){
      height+=$(this).height();  
    });
    if(height>$msgContent.height())
    {
      alert("greater "+height);
      $msgContent.scrollTop(height-$msgPost.height());
    }
    
}

function getDestinationId(enduser)
{
  console.log('in destintation');
  for (var key in usersList) {
    if(key===enduser){
        if (usersList.hasOwnProperty(key)) {
         return usersList[key];
        // use val
      }
    }
  }
}
function getDestinationName(socketid,userslist)
{
 for(var key in userslist)
    {
      if(userslist.hasOwnProperty(key))
      {
        if(userslist[key]===socketid)
        {
          return key;
        }
      }
    } 
}
//append recent message at senders chat box
function addToChatBox(tweet,receiverid)
{
    console.log('in add chat box');
    var receiverName=receiverid;
    var time=formatDate(new Date());
    var $msgContent=$('#'+receiverName+'-chatwindow .chat-content');
    var $msgPost=$('<div/>',{class:'message-post'});
    var $bubble=$('<div/>',{class:'speech-bubble'});
    var $arrowUp=$('<div/>',{class:'arrow up'});
    var $senderDiv=$('<p/>',{class:'sender-name',text:"You "});
    var $spanTime=$('<span/>',{text:time});
    var $tweetSpan=$('<span/>',{class:'p-msg',text:tweet});
    
    $senderDiv.append($spanTime);
    $bubble.append($arrowUp).append($tweetSpan);
    $msgPost.append($senderDiv).append($bubble);
    $msgContent.append($msgPost);
}

