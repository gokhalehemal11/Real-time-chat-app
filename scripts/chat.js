var cur_email = "";
var cur_name = "";
var cur_photo = "";
var total_chats = 0;
var all_chat_msgs = [];
var recent_chats= [];
var reads= 0;

// Detect the change of user authentication state. Whether user is logged in or logged out
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('user logged in: ', user);
    cur_email = user.email;
    cur_name = user.displayName ? user.displayName : user.email;
    cur_photo = user.photoURL ? user.photoURL : '/images/user/pp.png';
    document.querySelector(".chat-caption").getElementsByTagName("h5")[0].innerHTML = cur_name;
    document.querySelector(".chat-profile").getElementsByTagName("img")[0].src = cur_photo;
    ListenForUpdates();
    //console.log(cur_email);
    //window.location.replace("next.html");
  } else {
    console.log('user logged out');
    window.location.replace("sign-in.html");
  }
});

const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  db.collection('users').doc(cur_email).update({
    status: false, // Set active status to false of this user
  }).then(function () {
    auth.signOut(); // User sign-out
  }).catch(function (error) {
    alert('Logout Error');
    console.log(error);
  });
});

// Listen for real time updates
function ListenForUpdates() {
  // query to listen to real time updates in user recent_chats collection
  const query = db.collection('chats')
    .where('participants', 'array-contains', cur_email)
    .orderBy('last_updated');

  query.onSnapshot(async snapshot => {
    for (const change of snapshot.docChanges()) {
      //console.log(change);
      if (document.querySelector("#chat-sidebar-new").contains(document.getElementById(change.doc.id))){
            document.querySelector("#chat-sidebar-new").removeChild(document.getElementById(change.doc.id));
      }
      if (change.type === 'added') {
        const data = change.doc.data();
        const id = change.doc.id;
        chat_photourl = "";
        chat_name = "";
        if (data.name) {
          chat_name = data.name;
          if (data.photo_url) {
            chat_photourl = data.photo_url ? data.photo_url : '/images/user/pp.png';
          } else {
            chat_photourl = "";
          }
        } else {
          const details = await GetDetails(data.participants);
          chat_name = details[0].name;
          chat_photourl = details[0].photo ? details[0].photo : '/images/user/pp.png';
          chat_email = details[1];
          chat_status = details[0].status;
        }
        recent_chats.push(chat_email);
        var chat_time= data.last_updated ? data.last_updated.toDate() : new Date();
        AddDiv(id, chat_name, chat_photourl, data.last_message, chat_status, chat_email, chat_time, true);  // Recent Chats
      } else if (change.type === "modified") {
        RefreshDiv(change.doc.id, change.doc.data().last_message, change.doc.data().last_updated);
      } else if (change.type === "removed") {
        RemoveDiv(change.doc.id);
      }
    }
  });
  NewChats();
}

const GetDetails = async function (participants) {
  var pariticipant_email = '';
  var res = '';
  for (const item of participants) {
    if (item != cur_email) {
      pariticipant_email = item;
      const doc = await db.collection('users').doc(pariticipant_email).get();
      var data = doc.data();
      return [data, pariticipant_email];
    }
  }
}

function AddDiv(id, name, photo, last_msg, status, email, chat_time, recent) {

  var active = status ? "text-success" : "text-dark";
  var chat_sidebar = recent ? document.querySelector("#chat-sidebar") : document.querySelector("#chat-sidebar-new");
  var chat = document.createElement("li");
  chat.setAttribute("id", id);
  const text = '<a role="tab" data-toggle="pill" href="#chatbox_' + id + '">' +
    '<div class="d-flex align-items-center">' +
    '<div class="avatar mr-3">' +
    '<img src="' + photo + '" alt="chatuserimage" class="avatar-50 ">' +
    '<span class="avatar-status"><i class="ri-checkbox-blank-circle-fill ' + active + '"></i></span>' +
    '</div>' +
    '<div class="chat-sidebar-name">' +
    '<h6 class="mb-0">' + name + '</h6>' +
    '<span class="last_msg">' + last_msg.slice(0, 14) + '</span>' +
    '</div>' +
    '<div class="chat-meta float-right text-center mt-2">' +
    '<span class="text-nowrap last_time">' + moment(chat_time).format("MMM D") + '</span>' +
    '</div>' +
    '</div>' +
    '</a>';
  chat.innerHTML = text;
  chat_sidebar.insertBefore(chat, chat_sidebar.childNodes[0]);
  total_chats++;
  chat.addEventListener('click', LoadMessages);

  var chat_detail = document.querySelector(".tab-content");
  var det = document.createElement("div");
  det.setAttribute("id", "chatbox_" + id);
  det.setAttribute("class", "tab-pane fade");
  det.setAttribute("role", "tabpanel");
  const chat_content = '<div class="chat-head">' +
    '<header class="d-flex justify-content-between align-items-center bg-white pt-3 pl-3 pr-3 pb-3">' +
    '<div class="d-flex align-items-center">' +
    '<div id="sidebar-toggle" class="sidebar-toggle">' +
    '<i class="ri-menu-3-line"></i>' +
    '</div>' +
    '<div class="avatar chat-user-profile m-0 mr-3">' +
    '<img src="' + photo + '" alt="avatar" class="avatar-50 ">' +
    '<span class="avatar-status"><i class="ri-checkbox-blank-circle-fill ' + active + '"></i></span>' +
    '</div>' +
    '<h5 class="mb-0">' + name + '</h5>' +
    '</div>' +
    '<div id="chat-user-detail-popup" class="scroller" class="scroller">' +
    '<div class="user-profile text-center">' +
    '<button type="submit" class="close-popup p-3"><i class="ri-close-fill"></i></button>' +
    '<div class="user mb-4">' +
    '<a class="avatar m-0">' +
    '<img src="' + photo + '" alt="avatar" class="avatar-50 ">' +
    '</a>' +
    '<div class="user-name mt-4"><h4>' + name + '</h4></div>' +
    '<div class="user-desc"><p>Cape Town, RSA</p></div>' +
    '</div>' +
    '<hr>' +
    '<div class="chatuser-detail text-left mt-4">' +
    '<div class="row">' +
    '<div class="col-6 col-md-6 title">Name:</div>' +
    '<div class="col-6 col-md-6 text-right">' + name + '</div>' +
    '</div><hr>' +
    '<div class="row">' +
    '<div class="col-6 col-md-6 title">Tel:</div>' +
    '<div class="col-6 col-md-6 text-right">072 143 9920</div>' +
    '</div><hr>' +
    '<div class="row">' +
    '<div class="col-6 col-md-6 title">Date Of Birth:</div>' +
    '<div class="col-6 col-md-6 text-right">July 12, 1989</div>' +
    '</div><hr>' +
    '<div class="row">' +
    '<div class="col-6 col-md-6 title">Gender:</div>' +
    '<div class="col-6 col-md-6 text-right">Male</div>' +
    '</div><hr>' +
    '<div class="row">' +
    '<div class="col-6 col-md-6 title">Language:</div>' +
    '<div class="col-6 col-md-6 text-right">Engliah</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="chat-header-icons d-flex">' +
    '<a href="javascript:void();" class="chat-icon-phone">' +
    '<i class="ri-phone-line"></i>' +
    '</a>' +
    '<a href="javascript:void();" class="chat-icon-video">' +
    '<i class="ri-vidicon-line"></i>' +
    '</a>' +
    '<a href="javascript:void();" class="chat-icon-delete">' +
    '<i class="ri-delete-bin-line"></i>' +
    '</a>' +
    '<span class="dropdown">' +
    '<i class="ri-more-2-line cursor-pointer dropdown-toggle nav-hide-arrow cursor-pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" role="menu"></i>' +
    '<span class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">' +
    '<a class="dropdown-item" href="JavaScript:void(0);"><i class="fa fa-thumb-tack" aria-hidden="true"></i> Pin to top</a>' +
    '<a class="dropdown-item" href="JavaScript:void(0);"><i class="fa fa-trash-o" aria-hidden="true"></i> Delete chat</a>' +
    '<a class="dropdown-item" href="JavaScript:void(0);"><i class="fa fa-ban" aria-hidden="true"></i> Block</a>' +
    '</span>' +
    '</span>' +
    '</div>' +
    '</header>' +
    '</div>' +
    '<div class="chat-content scroller">' +
    '</div>' +
    '<div class="chat-footer p-3 bg-white">' +
    '<form class="d-flex align-items-center"  action="javascript:void(0);" id="form_' + id + '">' +
    '<div class="chat-attagement d-flex">' +
    '<a href="javascript:void();"><i class="fa fa-smile-o pr-3" aria-hidden="true"></i></a>' +
    '<a href="javascript:void();"><i class="fa fa-paperclip pr-3" aria-hidden="true"></i></a>' +
    '</div>' +
    '<input type="hidden" class="form-control mr-3" id="chat_id" value="' + id + '">' +
    '<input type="hidden" class="form-control mr-3" id="to" value="' + email + '">' +
    '<input type="text" autocomplete="off" class="form-control mr-3" id="msg" placeholder="Type your message">' +
    '<button type="submit" class="btn btn-primary d-flex align-items-center p-2"><i class="fa fa-paper-plane-o" aria-hidden="true"></i><span class="d-none d-lg-block ml-1">Send</span></button>' +
    '</form>' +
    '</div>';
  det.innerHTML = chat_content;
  det.getElementsByTagName('form')[0].addEventListener('submit', SendMessage);
  chat_detail.appendChild(det);
}

function RefreshDiv(changed_div, last_msg, last_time) {
  var chat_sidebar = document.querySelector("#chat-sidebar");
  var chat = document.getElementById(changed_div);
  chat.querySelector(".last_msg").innerHTML = last_msg.slice(0, 14);
  chat.querySelector(".last_time").innerHTML= moment(new Date()).format("MMM D");
  chat_sidebar.insertBefore(chat, chat_sidebar.childNodes[0]);
}

function RemoveDiv(removed_div) {
  var chat_sidebar = document.querySelector("#chat-sidebar");
  var chat = document.getElementById(removed_div);
  chat_sidebar.removeChild(chat);
  total_chats--;
}

function LoadMessages() {
  var chat_content = document.querySelector("#chatbox_" + this.id + " .chat-content");
  var text = '';
  const chat_photo = document.getElementById(this.id).getElementsByTagName('img')[0].src;
  var query = db.collection("messages").doc(this.id).collection("conversation").orderBy('timestamp');
  if (chat_content.innerHTML === "" || !(all_chat_msgs.includes(chat_content.innerHTML))) {
    query.onSnapshot(snapshot => {
      for (const change of snapshot.docChanges()) {
        if(change.type === "added"){
          var data = change.doc.data();
          var msg_time = data.timestamp ? moment(data.timestamp.toDate()).format("MMM D, h:mm a") : moment(new Date()).format("MMM D, h:mm a");
          if (data.sender == cur_email) {
            const current = '<div class="chat" id="'+change.doc.id+'">' +
              '<div class="chat-user">' +
              '<a class="avatar m-0">' +
              '<img src="' + cur_photo + '" alt="avatar" class="avatar-35 ">' +
              '</a>' +
              '<span class="chat-time mt-1">' + msg_time + '</span>' +
              '</div>' +
              '<div class="chat-detail">' +
              '<div class="chat-message">' +
              '<p class="msg-text">' + data.msg + '</p>' +
              '</div>' +
              '</div>' +
              '</div>';
            text = text + current;
          } else {
            const current = '<div class="chat chat-left" id="'+change.doc.id+'">' +
              '<div class="chat-user">' +
              '<a class="avatar m-0">' +
              '<img src="' + chat_photo + '" alt="avatar" class="avatar-35 ">' +
              '</a>' +
              '<span class="chat-time mt-1">' + msg_time + '</span>' +
              '</div>' +
              '<div class="chat-detail">' +
              '<div class="chat-message">' +
              '<p class="msg-text">' + data.msg + '</p>' +
              '</div>' +
              '</div>' +
              '</div>';
            text = text + current;
          }
        }
        else if(change.type === "removed"){
          chat_content.removeChild(document.getElementById(change.doc.id));
        }
      }
      chat_content.innerHTML = text;
      chat_content.scrollTop = chat_content.scrollHeight;
      all_chat_msgs.push(text);
    });
  }
}

function SendMessage(e) {
  e.preventDefault();
  const msg = this['msg'].value;
  const to = this['to'].value;
  const doc_name = this['chat_id'].value;
  //console.log(to,msg,doc_name);
  db.collection('messages').doc(doc_name).collection('conversation').add({
      sender: cur_email,
      msg: msg,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function () {
      db.collection('chats').doc(doc_name).set({
        last_updated: firebase.firestore.FieldValue.serverTimestamp(),
        last_message: msg,
        participants: [cur_email, to]
      }, {
        merge: true
      });
    })
    .catch(function (error) {
      alert('Error sending message');
      console.log(error);
    });
  this.reset();
}


// New Chats
function NewChats(){
  setTimeout(function(){ 
    const query= recent_chats.length > 0 ?
                   db.collection('users')
                   .where(firebase.firestore.FieldPath.documentId(), 'not-in', recent_chats)
                   : db.collection('users');
    query.onSnapshot(snapshot=> {
      for (const change of snapshot.docChanges()) {  
        var chat_email= change.doc.id;
        if (chat_email != cur_email){
          var docid= cur_email > chat_email ?  cur_email+"_"+chat_email : chat_email+"_"+cur_email;
          var hash= 0;
          for (i = 0; i < docid.length; i++) {
            char = docid.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
          var data= change.doc.data();
          var name= data.name;
          var photo= data.photo ? data.photo : '/images/user/pp.png';
          var status= data.status;
          AddDiv(hash, name, photo, "Start chat", status, chat_email, new Date(), false);
        }
      }
    });
  } , 8000);
}
