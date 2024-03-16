#!/usr/bin/env node
// based on the code linked from here https://ethereum.stackexchange.com/a/47036

const Wallet = require('ethereumjs-wallet'), fs = require('fs');

/**
 * exit program and print password if it works to decrypt a given ETH wallet.
 */
const tryPassword = (walletData, password)  => {
  try {
    const myWallet = Wallet.fromV3(walletData, password, true);
    console.log("Wallet address: " + myWallet.getAddress().toString('hex'));
    console.log(`password worked!!! "${password}"`);
    //console.log("Private Key: " + myWallet.getPrivateKey().toString('hex')) 
    process.exit(0);
  } catch(e) {
    const err = e.toString();
    if (e.toString() !== 'Error: Key derivation failed - possibly wrong passphrase') {
      throw e;
    }
  }

};


const fname = process.argv.slice(2, 3).toString();
console.log(`reading keystore file "${fname}"`);


const walletData = fs.readFileSync(fname).toString();
// test for example file:
//tryPassword(walletData, 'wrongpass');
//tryPassword(walletData, 'password123');

// path to text file of possible passwords ('\n' delimeted)
const listName = process.argv.slice(3, 4).toString();
console.log(`reading list of possible passwords: "${listName}"`);
let list = fs.readFileSync(listName).toString().split('\n');
list = list.filter(p => p); // remove any empty lines ("")

for (let p of list) {
  //console.log(`trying pass "${p}"`);
  tryPassword(walletData, p);
}

