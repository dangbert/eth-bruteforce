#!/usr/bin/env node
const bip39 = require('bip39');
const fs = require('fs');

const fname = process.argv.slice(2, 3).toString();
console.log(`reading mneomonic file "${fname}"`);
let phrases = fs.readFileSync(fname).toString().split('\n');
phrases = phrases.filter((p) => p); // remove any empty lines ("")

for (let i = 0; i < phrases.length; i++) {
  const p = phrases[i];
  console.log(`trying phrase ${i}... `);

  if (bip39.validateMnemonic(p)) {
    console.log('VALID!!!');
    console.log(p);
    process.exit(0);
  }
}
console.log('\nall done!');
