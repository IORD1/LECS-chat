

var crypto = require('crypto') //Node.js or Browserify (browser)

var ecdsa = require('ecdsa');
var privateKey = 'MHQCAQEEILJOkvaNt8GU7fEKCuBWMYP5J0fYgFaTeOYJTFQvhWJFoAcGBSuBBAAKoUQDQgAEVvWfiv4b/0YbtfsAMxg1QPrfenwJkiQJHjWMEhSamywDVUJtd4V8IBeuRz5q91EYVAlj3dtXxzdXMLMSAFSe/w==';
var publicKey = 'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEVvWfiv4b/0YbtfsAMxg1QPrfenwJkiQJHjWMEhSamywDVUJtd4V8IBeuRz5q91EYVAlj3dtXxzdXMLMSAFSe/w==';
var msg = "hello world!";
var shaMsg = crypto.createHash('sha2a56').update(msg).digest();
var signature = ecdsa.sign(shaMsg, privateKey)
var isValid = ecdsa.verify(shaMsg, signature, publicKey)
console.log(isValid) //true


