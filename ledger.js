#!/usr/bin/env node
const bip39 = require('bip39');
const fs = require('fs');


function readSet() {
  const fname = "./english.txt"
  console.log(`reading dictionary file "${fname}"`);
  let words = fs.readFileSync(fname).toString().split('\n');
  return new Set(words);
}

const WORDS = readSet();

// read list of phrases to try
const fname = process.argv.slice(2, 3).toString();
console.log(`reading mneomonic file "${fname}"`);
let phrases = fs.readFileSync(fname).toString().split('\n');
phrases = phrases.filter((p) => p); // remove any empty lines ("")
phrases = [...phrases]; // ensure array

console.log(`read ${phrases.length} phrases`);
const finalPhrases = [];
for (let i = 0; i < phrases.length; i++) {
  const p = phrases[i];
  console.log(p);

  // validate all words in phrase
  const words = p.split(" ");
  if (words.length != 24) {
    console.log(`WARNING: only ${words.length} present`);
    process.exit(1);
  }
  for (let n = 0; n < words.length; n++) {
    const word = words[n];
    //console.log("validating: ", word);
    if (!WORDS.has(word)) {
      console.log(`invalid word '${word}'`);
      process.exit(1);
    }
  }
  finalPhrases.push(p);
}


console.log(`\n\ntrying ${finalPhrases.length} final phrases:`);
for (let i = 0; i < finalPhrases.length; i++) {
  console.log(`trying phrase ${i}... `);
  const p = finalPhrases[i];
  if (bip39.validateMnemonic(p)) {
    console.log('VALID!!!');
    console.log(p);
    process.exit(0);
  }
}
console.log('\nall done!');
