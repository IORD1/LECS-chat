var crypto = require("crypto");
var eccrypto = require("eccrypto");
const { type } = require("os");
const fs = require('fs');
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
eccrypto.sign(privateKey, msg).then(function (sig) {
  console.log("Signature in DER format:", sig);
  // Write data in 'Output.txt' .
  fs.writeFile('Output.txt', sig, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  })
  console.log('verification ------>')
  eccrypto.verify(publicKey, msg, sig).then(function () {
    console.log("Signature is OK");
  }).catch(function () {
    console.log("Signature is BAD");
  });
});


fs.readFile("Output.txt",function (err, data) {
  if (err) {
    return console.error(err);
  }
  console.log("Data read : " + data.toString());

});




// console.log('verification ------>')
// eccrypto.verify(publicKey, msg, sigs).then(function () {
//   console.log("Signature is OK");
// }).catch(function () {
//   console.log("Signature is BAD");
// });




