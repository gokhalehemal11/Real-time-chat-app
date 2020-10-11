var email="";
var dispname="";

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
    db.collection('users').doc(email).update({
    status: true,
    }).then(function(){
      window.location.replace("index.html");
    }).catch(function(error) {
      console.error('Error writing to database', error);
    });
  });
});

const google_sign_in= document.querySelector("#google-sign-in");
google_sign_in.addEventListener('click', (e) =>{
  e.preventDefault();
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(cred =>{
    //console.log(cred.user);
    db.collection('users').doc(cred.user.email).set({
      name: cred.user.displayName,
      photo: cred.user.photoURL,
      status: true
    } ,  {
        merge: true
      }).then(function(){
        window.location.replace("index.html");
      }).catch(function(error) {
      console.error('Error writing to database', error);
    });
  });
});
