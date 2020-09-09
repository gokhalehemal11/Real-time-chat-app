// Global variables to store the chat_history (past chats of user and logged in user email)
var cur_email= "";
var chat_history= []

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


// logout
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
});

// Listen for real time updates
function ListenForUpdates(){
  // query to listen to real time updates in user recent_chats collection
  const query = db.collection("users")
                  .doc(cur_email)
                  .collection('recent_chats')
                  .orderBy('timestamp', 'desc');

  query.onSnapshot(function(snapshot) {
      snapshot.forEach(doc => {
        console.log(doc.id);
    });
  });
}

