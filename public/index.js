
import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';
import { getAuth, onAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js';
import { getFirestore,collection,getDocs,setDoc,doc,addDoc } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js';
import {getDatabase, ref, set,onValue } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js';

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



//detect auth state
onAuthStateChanged(auth,user => {

    if (user) {
        // signed in

        document.getElementById("whenSignedIn").hidden = false;
        document.getElementById("whenSignedOut").hidden = true;
        document.getElementById("userDetails").innerHTML = `<p>Hello ${user.displayName.split(" ")[0]} !</p> `;
        document.getElementById("userdp").src = user.photoURL;

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
  // console.log(timenow);
  // console.log(d);


  // var linkeditdelete = '<li>'+
  // '<a href="#" >✓</a>' + 
  // '<button></button>' +
  // '</li>';

  // $("#display").append(linkeditdelete);


  set(ref(database, "People/"+timenow),{
    Name: auth.currentUser.displayName,
    Message : enterMessage,
    time:  d,
    dp : auth.currentUser.photoURL
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



document.getElementById("signOutBtn").onclick = () => auth.signOut();



var counter = 0;

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
                                  data[key].Message +
                              '  </div>'+
                              '</div>'
        $("#display").append(linkeditdelete);

    }
  }
  console.log(counter ,data);
  counter++;
  
});


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