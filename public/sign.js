var crypto = require("crypto");
var eccrypto = require("eccrypto");

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
var sigs ;
eccrypto.sign(privateKey, msg).then(function(sig) {
  console.log("Signature in DER format:", sig);
  sigs = sig;
  
});

console.log(sigs);
  console.log('verification ------>')
    eccrypto.verify(publicKey, msg, sigs).then(function() {
    console.log("Signature is OK");
  }).catch(function() {
    console.log("Signature is BAD");
  });