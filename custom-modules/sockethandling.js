//==========module for handling socket connections
// var io=require('socket.io');
var onlineUsers={};
var activeSockets={};
var io;

function socketHandler(socket)
{
	console.log("socketio initialized and ready for connection!!!");
	
	//using param socket object 
    socket.on('chat message',function(chatMsg){
    console.log('User Message '+ chatMsg);
    
    var user=activeSockets[socket.id];

    io.emit('broadcast message',{ msg : chatMsg,username:user});//send to all including sender

  });

  socket.on('disconnect',function()
  {
    console.log('disconnected');
    
    var username=activeSockets[socket.id];
    delete onlineUsers[username];//delete user object
    delete activeSockets[socket.id];//print objects to debug
    userLeft(socket,username);
    
  });

  //custom events
  socket.on('set user',function(username){

    //check if username exist
    if(onlineUsers[username]===undefined)
    {
      //does not exist so proceed
      onlineUsers[username]=socket.id;//assign specific socket id to user
      activeSockets[socket.id]=username;
      UserAvailable(socket.id,username);//check for availablity
      userJoined(socket,username);
    }
    else if(onlineUsers[username]===socket.id)
    {
        //test condition pending
    }
    else{
      userAlreadyExist(socket.id,username);
    }
  });
 
 socket.on('private message',function(data){
      var sender=activeSockets[data.senderid];
      var msg=data.message;
      console.log("users name "+sender);
      io.to(data.receiverid).emit("private message",{
                                                    "senderid":sender,
                                                    "message":msg
                                                });
    });

}

function UserAvailable(sid,username)
  {
    setTimeout(function(){
      console.log('sending welcome message to '+username+' at socketid '+sid);
      io.to(sid).emit('welcome',{
                                'username':username,
                                'sid':sid,
                                'currentUsers':Object.keys(onlineUsers),
                                'socketids':onlineUsers
                                });
    }, 500);
  }


function userJoined(socket,username)
  {
    console.log('sending broadcast to all except invoker');

    socket.broadcast.emit('user joined',{
                                        'username':username,
                                        'currentUsers':Object.keys(onlineUsers),
                                        'socketids':onlineUsers});
    // sending to all sockets except current user
    
  }
  
  function userLeft(socket,username)
  {
    socket.broadcast.emit('user left',{"username":username,'currentUsers':Object.keys(onlineUsers)});
  }

  function userAlreadyExist(socketid,uname)
  {

  }


module.exports={
	startTwiddle:function(http)
	{

		console.log("inside custom module start");
	  io=require('socket.io')(http);
    io.on('connection',socketHandler);//represents the app
	}
}
