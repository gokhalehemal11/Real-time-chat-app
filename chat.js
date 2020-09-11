// Global variables to store the chat_history (past chats of user and logged in user email)
var cur_email= "";
var chat_history= []
var total_chats=0;

// Detect the change of user authentication state. Whether user is logged in or logged out
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('user logged in: ', user);
    cur_email= user.email;
    ListenForUpdates();
    //console.log(cur_email);
    //window.location.replace("next.html");
  } else {
    console.log('user logged out');
    window.location.replace("chat.html");
  }
});


/*// logout
const logout = document.querySelector('#logout');
//console.log(logout)
logout.addEventListener('click', (e) => {
  e.preventDefault();
  db.collection('users').doc(auth.currentUser.email).update({
    status: false,      // Set active status to false of this user
  }).then(function(){
      auth.signOut();   // User sign-out
  }).catch(function(error) {
    console.error('Error writing new message to database', error);
  });
});

// Store 1-1 chat in the database
const chatform = document.querySelector('#chat');
chatform.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const to = chatform['to'].value;      // recipient email
  const msg = chatform['message'].value;  // message text
  const doc_name= to > auth.currentUser.email ? auth.currentUser.email+"_"+to : to+"_"+auth.currentUser.email;  
  // document name of the 1-1 chat 
  console.log(to,msg,doc_name);
   db.collection('messages').doc(doc_name).collection('chat').add({ 
   //This function will generate/update document name of the 1-1 chat
    sender: auth.currentUser.email,
    msg: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp() // store message with timestamp in database
  }).then(function(){
      db.collection('users').doc(auth.currentUser.email).collection('recent_chats').doc(doc_name).set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp()    
      // Add chat name to collection of recent_chats current user recent_chats
    });
  }).then(function(){
    db.collection('users').doc(to).collection('recent_chats').doc(doc_name).set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp()  
      // Add chat name to collection of recent_chats recipient recent_chats
    });
  })
  .catch(function(error) {
    console.error('Error writing new message to database', error);
  });
});

// Store group chat in database
const groupChat = document.querySelector('#groupchat');
groupChat.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const msg = groupChat['groupmessage'].value;
  const doc_name= groupChat['groupname'].value;
   db.collection('groups').doc(doc_name).collection('chat').add({
    sender: auth.currentUser.email,
    msg: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(error) {
    console.error('Error writing new message to database', error);
  });
});*/

// Listen for real time updates
function ListenForUpdates(){
  // query to listen to real time updates in user recent_chats collection
  const query = db.collection("users")
                  .doc(cur_email)
                  .collection('recent_chats')
                  .orderBy('timestamp', 'desc');

  query.onSnapshot(function(snapshot) {
      snapshot.forEach(doc => {
        chat_history.push(doc.id);
    });
      console.log(total_chats, chat_history.length);
      if(total_chats < chat_history.length){
        AddDiv();      // Add div for new contact in chat-sidebar 
        RefreshUI();  // Refresh chats of the users contacted and listen for updates
      }
      else{
        RefreshUI();  // Refresh chats of the users contacted and listen for updates
      }
  });
}

function RefreshUI(){
  var count=0; 
  //console.log(chat_history);
  var text= '';
  total_chats= chat_history.length;
  chat_history.forEach(item=>{
    count=count+1;
    var chat_content= document.querySelector("#chatbox"+count.toString()+" .chat-content");
    var query= db.collection("messages").doc(item).collection("chat").orderBy('timestamp');
     query.get().then(function(snapshot) {
      snapshot.forEach(doc => {
        var data= doc.data();
        var current='';
          if(data.sender == cur_email){
            current='<div class="chat">'+
                '<div class="chat-user">'+
                  '<a class="avatar m-0">'+
                    '<img src="images/user/1.jpg" alt="avatar" class="avatar-35 ">'+
                  '</a>'+
                    '<span class="chat-time mt-1">6:45</span>'+
                '</div>'+
                '<div class="chat-detail">'+
                  '<div class="chat-message">'+
                    '<p class="msg-text">'+data.msg+'</p>'+
                  '</div>'+
                '</div>'+
              '</div>';
        }
        else{
          current='<div class="chat chat-left">'+
                '<div class="chat-user">'+
                  '<a class="avatar m-0">'+
                    '<img src="images/user/1.jpg" alt="avatar" class="avatar-35 ">'+
                  '</a>'+
                    '<span class="chat-time mt-1">6:45</span>'+
                '</div>'+
                '<div class="chat-detail">'+
                  '<div class="chat-message">'+
                    '<p class="msg-text">'+data.msg+'</p>'+
                  '</div>'+
                '</div>'+
              '</div>';
        }        
        text= text+current;
      });
      chat_content.innerHTML= text;
      text='';
    });
  });
  chat_history=[];
}

function AddDiv(){
  var chat_sidebar = document.querySelector("#chat-sidebar");
  var all_chats= document.querySelector('#all_chats');
  var text= '';
  var chat_content= '';
  var count= 0;
  chat_history.forEach(item=>{
    count= count+1;
    var current= '<li>'+
               '<a role="tab" data-toggle="pill" href="#chatbox'+count.toString()+'">'+
                  '<div class="d-flex align-items-center">'+
                     '<div class="avatar mr-3">'+
                        '<img src="images/user/07.jpg" alt="chatuserimage" class="avatar-50 ">'+
                        '<span class="avatar-status"><i class="ri-checkbox-blank-circle-fill text-warning"></i></span>'+
                     '</div>'+
                     '<div class="chat-sidebar-name">'+
                        '<h6 class="mb-0">'+item+'</h6>'+
                        '<span>There are many </span>'+
                     '</div>'+
                  '</div>'+
                '</a>'+
             '</li>';
    text= text+current;
  });
  chat_sidebar.innerHTML= text;
}