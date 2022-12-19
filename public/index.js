import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';
import { getAuth, onAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js';
import { getFirestore,collection,getDocs,setDoc,doc,addDoc } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js';
import {getDatabase, ref, set,onValue } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js';
require(['eccrypto'], function (eccrypto) {
  privateKey = eccrypto.generatePrivate();
  publicKey = eccrypto.getPublic(privateKey);
});
const firebaseapp = initializeApp({
  apiKey: "AIzaSyDURV-9NnakYNiBlyMUbIqykhOl2hQCYQ0",
  authDomain: "lecs-chat.firebaseapp.com",
  databaseURL: "https://lecs-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lecs-chat",
  storageBucket: "lecs-chat.appspot.com",
  messagingSenderId: "199711899591",
  appId: "1:199711899591:web:fe8db5b1909721243163e2",
  measurementId: "G-R3CLB772MX"});

const auth = getAuth(firebaseapp);
const db = getFirestore(firebaseapp);
const database = getDatabase(firebaseapp);
var counter = 0;
// A new random 32-byte private key.
var privateKey;
var publicKey;
console.log("private key ----->");
console.log(privateKey);
// Corresponding uncompressed (65-byte) public key.
console.log("public key ----->");
console.log(publicKey);

var str = "message to sign";
require(['crypto'], function (cryptos) {
//detect auth state
onAuthStateChanged(auth,user => {

    if (user) {
        // signed in

        document.getElementById("whenSignedIn").hidden = false;
        document.getElementById("whenSignedOut").hidden = true;
        document.getElementById("userDetails").innerHTML = `<p>Hello ${user.displayName.split(" ")[0]} !</p> `;
        document.getElementById("userdp").src = user.photoURL;
        document.getElementById("chatdp1").src = user.photoURL;

    } else {
        // not signed in
        document.getElementById("whenSignedIn").hidden = true;
        document.getElementById("whenSignedOut").hidden = false;
        document.getElementById("userDetails").innerHTML = '';
    }
});
const provider = new GoogleAuthProvider(firebaseapp);

googleBtn.addEventListener('click', (e) => {

console.log('initiating login process');
signInWithPopup(auth, provider)
.then((result) => {
  // This gives you a Google Access Token. You can use it to access the Google API.
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential.accessToken;
  // The signed-in user info.
  const user = result.user;
  // name = displayName
  // email = email
  // photo = photoURL

  // ...
}).catch((error) => {
  // Handle Errors here.
  const errorCode = error.code;
  const errorMessage = error.message;
  // The email of the user's account used.
  const email = error.email;
  // The AuthCredential type that was used.
  const credential = GoogleAuthProvider.credentialFromError(error);
  // ...
  alert(errorMessage);
});
});

$("display").html('');

send.addEventListener('click', () => {
  
  // Add a new document with a generated id.
  var enterMessage = document.getElementById("sendinput").value;
  console.log(enterMessage);
  console.log(auth.currentUser.displayName);
  const d = new Date().toLocaleString();
  let timenow = "";
  for(let i=0;i<20; i++){
    if(d[i] != "/" && d[i] != "," && d[i] != ":" && d[i] != " "){
      timenow = timenow + d[i];
    }
  }
  timenow = parseInt(timenow);

  set(ref(database, "MessageCounter/"),{
    count : counter + 1
  })
  .then(()=>{
      console.log("Data added successfully");
  })
  .catch((error)=>{
      alert(error);
  });




      var msg = cryptos.createHash("sha256").update(str).digest();
      eccrypto.sign(privateKey, msg).then(function (sig) {
        console.log("Signature in DER format:", sig);
        set(ref(database, "People/"+counter),{
          Name: auth.currentUser.displayName,
          Message : enterMessage,
          time:  d,
          dp : auth.currentUser.photoURL,
          signature : sig
        })
        .then(()=>{
            console.log("Data added successfully");
            document.getElementById("sendinput").value = "";
            document.getElementById("sendinput").placeholder = "Data sent successfully";
        })
        .catch((error)=>{
            alert(error);
        });
      

  });





  





});



document.getElementById("signOutBtn").onclick = () => auth.signOut();




const starCountRef = ref(database, 'People/' );
onValue(starCountRef, (snapshot) => {
  const data = snapshot.val();
  document.getElementById("display").innerHTML = "";
  $("display").html('');
  for (const key in data){
    if(data.hasOwnProperty(key)){
      console.log(`${key} : ${data[key].Message}`)

        var linkeditdelete =  '<div class="chat">'+
                              '  <div class="chatdp">'+
                              '    <img src="'+
                                  data[key].dp +
                              '" id="chatdp1">'+
                              '  </div>'+
                              '  <div class="message-body">'+
                              '    <div class="time">'+
                                      data[key].time+
                              '     </div>'+
                              '      <div class="message">'+
                                      data[key].Message +
                              '       </div>'+
                              '   </div>'+
                              '</div>'
        $("#display").append(linkeditdelete);

    }
  }
  console.log(counter ,data);
  counter++;
  
});


const messagecount = ref(database, 'MessageCounter/' );
onValue(messagecount, (snapshot) => {
  const data = snapshot.val();
  console.log(data);
  
});
});

// .........................locking PaymentMethodChangeEvent.apply......................
var passcode = "";
var passlength = 0;
var repasscode = "";

lock.addEventListener('click', () => {
  document.getElementById("whenSignedIn").hidden = true;
  document.getElementById("whenSignedOut").hidden = true;
  document.getElementById("whenlocked").hidden = false;
});

if(passlength < 5 || repasscode == ""){
  numpads1.addEventListener('click',() =>{passcode = passcode + "1";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads2.addEventListener('click',() =>{passcode = passcode + "2";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads3.addEventListener('click',() =>{passcode = passcode + "3";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads4.addEventListener('click',() =>{passcode = passcode + "4";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads5.addEventListener('click',() =>{passcode = passcode + "5";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads6.addEventListener('click',() =>{passcode = passcode + "6";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads7.addEventListener('click',() =>{passcode = passcode + "7";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads8.addEventListener('click',() =>{passcode = passcode + "8";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  numpads9.addEventListener('click',() =>{passcode = passcode + "9";document.getElementById("screen-pin").innerHTML = passcode;passlength = passlength + 1;});
  zerobtn.addEventListener('click',() =>{passcode = passcode + "0";document.getElementById("screen-pin").innerHTML = passcode;});
  backbtn.addEventListener('click',() =>{passcode = passcode.slice(0, -1) ;document.getElementById("screen-pin").innerHTML = passcode;});
}else{
  if(passlength = 4 || repasscode.length < 5){
    document.getElementById("lock-heading-text").innerHTML = "Re-Enter Password";
    document.getElementById("screen-pin").innerHTML = "";
  }
}













// just chekcing github erros 

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>addDoc>>>>>>>>>>>>>>>>>>>>>>>


// function sendtext(){
//   document.getElementById("display").innerHTML = 'sended text';
// }

//   try {
//       const docRef = await addDoc(collection(db, "test"), {
//       sender : 'pratham'
//         });
//       console.log("Document written with ID: ", docRef.id);
//     } catch (e) {
//       console.error("Error adding document: ", e);
//     }
// // Add a new document in collection "cities"



// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        
// import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
// import {
//   getFirestore,collection,addDoc,doc,setDoc,getDocs
// } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
// import {
// getAuth,
// GoogleAuthProvider,
// signInWithRedirect,
// getRedirectResult,
// signInWithPopup,
// signOut
// } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
// console.log("imported");


// // // Initialize Firebase

// // Required for side-effects
// const firebaseConfig = { 
//   apiKey: "AIzaSyAbEc5jQBHJ22W0Oe69Foh_kXH9iSGaf38",
//   authDomain: "lecs-messaging.firebaseapp.com",
//   projectId: "lecs-messaging",
//   storageBucket: "lecs-messaging.appspot.com",
//   messagingSenderId: "539453436104",
//   appId: "1:539453436104:web:e0a5a4e793f40b04f4f5fd"
//   };
//   console.log("firebase config done");

//   const app = initializeApp(firebaseConfig);
//   const provider = new GoogleAuthProvider(app);
//   const auth = getAuth(app);


// console.log("adding eventlistner for button")

// // Initialize Cloud Firestore and get a reference to the service
// const db = getFirestore(app);

// googleBtn.addEventListener('click', (e) => {

// console.log('initiating login process');
// signInWithPopup(auth, provider)
// .then((result) => {
//   // This gives you a Google Access Token. You can use it to access the Google API.
//   const credential = GoogleAuthProvider.credentialFromResult(result);
//   const token = credential.accessToken;
//   // The signed-in user info.
//   const user = result.user;
//   // name = displayName
//   // email = email
//   // photo = photoURL

//   // ...
// }).catch((error) => {
//   // Handle Errors here.
//   const errorCode = error.code;
//   const errorMessage = error.message;
//   // The email of the user's account used.
//   const email = error.email;
//   // The AuthCredential type that was used.
//   const credential = GoogleAuthProvider.credentialFromError(error);
//   // ...
//   alert(errorMessage);
// });
// });
// console.log('5');

// auth.onAuthStateChanged(user => {
// if (user) {
// // signed in
// document.getElementById("whenSignedIn").hidden = false;
// document.getElementById("whenSignedOut").hidden = true;
// document.getElementById("userDetails").innerHTML = `<p>Hello ${user.displayName.split(" ")[0]} !</p> `;
// document.getElementById("userdp").src = user.photoURL;

// } else {
// // not signed in
// document.getElementById("whenSignedIn").hidden = true;
// document.getElementById("whenSignedOut").hidden = false;
// document.getElementById("userDetails").innerHTML = '';
// }
// });






// try {
//     const docRef = await addDoc(collection(db, "test"), {
//     sender : user.displayName
//       });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// Add a new document in collection "cities"

//  document.getElementById("send").onclick = sendtext();


//   function sendtext(){
//     var user = auth.currentUser;
//     alert();
//     console.log(user.displayName);
//     var inputext = document.getElementById("sendinput").value;
//     console.log(user.displayName,'=>',inputext);
//   }

//   console.log(user);
//   console.log(user.displayName);
//     const docRef = await addDoc(collection(db, "test"), {
//     name: "yook",
//     sendern:user.displayName

// });
// const querySnapshot = await getDocs(collection(db, "test"));
// querySnapshot.forEach((doc) => {
//   // doc.data() is never undefined for query doc snapshots
//   console.log(doc.data().sendern, " => ", doc.data().name);
// });





// document.getElementById("signOutBtn").onclick = () => auth.signOut();


  // console.log(data.replace(/^\{(.*)\}$/,"[$1]"));
  // const myJSON = JSON.stringify(data);
  // const replaced = myJSON.replace('{', '[');
  // var replaced2 = replaced.replace(/.$/, ']');
  // replaced2 = '{"array":' + replaced2 + '}';
  // const newData = JSON.parse(replaced2);