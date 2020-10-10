var NewSignUp= false;
var email="";
var dispname="";

// Liten for the change in Auth state of user. Signed In, Signed Out or Newly Signed Up.
auth.onAuthStateChanged(user => {
  if (user) {         // If a user signed up or signed in
    if(NewSignUp){    // New user sign-up and adding to database
      AddUsertoDb(email,dispname);
      console.log('New user logged in: ', user);
    }
  } else {
    console.log('user logged out');
  }
});

// New User Sign-up 
const signupForm = document.querySelector('#signup');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  email = signupForm['signupemail'].value;
  const password = signupForm['signuppassword'].value;
  dispname= signupForm['dispname'].value;

  // sign up the user
  // This will reflect in onAuthStateChanged().
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    signupForm.reset();
    NewSignUp= cred.additionalUserInfo.isNewUser;
    cred.user.updateProfile({
       displayName: dispname
    });
  });
});

// Adding new user info to database
function AddUsertoDb(email,dispname) {
  db.collection('users').doc(email).set({
    name: dispname,
    status: true
  }).then(function(){
    window.location.replace("index.html");
  }).catch(function(error) {
    console.error('Error writing to database', error);
  });
}
