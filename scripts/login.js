var email="";
var dispname="";

// Liten for the change in Auth state of user. Signed In, Signed Out or Newly Signed Up.
auth.onAuthStateChanged(user => {
  if (user) {         // If a user signed up or signed in
    UpdateStatus(user.email);   // User sign in and update status
    console.log('user logged in: ', user);
  } else {
    console.log('user logged out');
    //window.location.replace("chat.html");
  }
});

// User Sign-in 
const loginForm = document.querySelector('#login');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = loginForm['email'].value;
  const password = loginForm['password'].value;

  // authorize the user login
  // Successful login shall reflect in onAuthStateChanged(). 
  auth.signInWithEmailAndPassword(email, password).then(cred => {
    loginForm.reset();
  });
});

// Update active status of user after login
function UpdateStatus(docname){
  //console.log(docname);
  db.collection('users').doc(docname).update({
    status: true,
  }).then(function(){
    window.location.replace("index.html");
  }).catch(function(error) {
    console.error('Error writing to database', error);
  });
}
