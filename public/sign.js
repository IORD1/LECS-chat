var crypto = require("crypto");
var eccrypto = require("eccrypto");
var ecdsa = require('ecdsa');

// A new random 32-byte private key.
var privateKey = eccrypto.generatePrivate();
console.log("private key ----->");
console.log(privateKey);
// Corresponding uncompressed (65-byte) public key.
var publicKey = eccrypto.getPublic(privateKey);
console.log("public key ----->");
console.log(publicKey);

var str = "message to sign";
// Always hash you message to sign!
var msg = crypto.createHash("sha256").update(str).digest();
console.log('yo');
var sig = eccrypto.sign(privateKey, msg);
console.log(sig);
for(var propName in sig) {
  if(sig.hasOwnProperty(propName)) {
      var propValue = sig[propName];
      console.log(propValue);
      console.log("yo1")
      // do something with each element here
  }
}




// var sign = eccrypto.sign(privateKey, msg.buffer);
// console.log('yo1')
// var response = eccrypto.verify(publicKey, msg, sign.buffer);
// console.log('yo2');
// console.log(response);

// fs.readFile("Output.txt",function (err, data) {
//   if (err) {
//     return console.error(err);
//   }
//   console.log("Data read : " + data.toString());

// });


// eccrypto.sign(privateKey, msg).then(function (sig) {
//   console.log("Signature in DER format:", sig);
//   console.log('verification ------>')
//   eccrypto.verify(publicKey, msg, sig).then(function () {
//     console.log("Signature is OK");
//   }).catch(function () {
//     console.log("Signature is BAD");
//   });
// });




// console.log('verification ------>')
// eccrypto.verify(publicKey, msg, sigs).then(function () {
//   console.log("Signature is OK");
// }).catch(function () {
//   console.log("Signature is BAD");
// });




