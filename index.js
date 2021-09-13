// based on the code linked from here https://ethereum.stackexchange.com/a/47036

const Wallet = require('ethereumjs-wallet'), fs = require('fs');

/**
 * please work
 */
const tryPassword = (walletData, password)  => {
  try {
    const myWallet = Wallet.fromV3(walletData, password, true);
    console.log("Address: " + myWallet.getAddress().toString('hex')) ;
    console.log(`password worked!!! "${password}"`);
    process.exit(0);
  } catch(e) {
    const err = e.toString();
    if (e.toString() !== 'Error: Key derivation failed - possibly wrong passphrase') {
      throw e;
    }
    //console.log('err: ' + err);
  }
  //console.log("Private Key: " + myWallet.getPrivateKey().toString('hex')) 

};


const exampleFile = "./example---UTC--2018-04-29T10-08-25.072Z--1f7c98090febf46155496a370002a10af7eb6766"
const exampleData = fs.readFileSync(exampleFile).toString();

tryPassword(exampleData, 'wrongpass');
tryPassword(exampleData, 'password123');

//const myWallet = Wallet.fromV3(fs.readFileSync(utcFile).toString(), password, true);
//console.log("Private Key: " + myWallet.getPrivateKey().toString('hex')) 
//console.log("Address: " + myWallet.getAddress().toString('hex')) 




