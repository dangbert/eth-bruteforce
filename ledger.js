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

console.log(`read ${phrases.length} phrases (expanding possible patterns)...`);
const finalPhrases = [];
for (let i = 0; i < phrases.length; i++) {
  const p = phrases[i];

  if (p[0] === "#") continue; // skip commented lines

  // validate all words in phrase
  const words = p.split(" ");
  if (words.length != 24) {
    console.log(`WARNING: only ${words.length} present`);
    process.exit(1);
  }

  const queue = [words];
  while (queue.length > 0) {
    // single phrase as list of words (maybe with patterns)
    const cur = queue.pop();

    let isSimple = true;
    const prefix = [];
    for (let k = 0; k < cur.length; k++) {
      const w = cur[k];
      const suffix = cur.slice(k+1);

      // handle possible comma separated options for this particular word
      let subwords = w.split(",");

      // wildcard
      if (w === "*") {
        subwords = Array.from(WORDS);
      }

      if (subwords.length > 1) isSimple = false;
      for (const t of subwords) {
        if (!WORDS.has(t)) {
          console.log(`invalid word '${t}'`);
          process.exit(1);
        }
        const candidate = prefix.concat([t]).concat(suffix)
        //queue.append(`${prefix} ${t} ${suffix});
        if (!isSimple) {
          queue.push(candidate);
        }
      }
      if (!isSimple) break;

      prefix.push(subwords[0]);
    }

    if (isSimple) {
      finalPhrases.push(cur);
    }
  }
}

// final sanity check
console.log(`\n\nsanity check to validate ${finalPhrases.length} final phrases:`);
for (const words of finalPhrases) {
  for (const word of words) {
    if (!WORDS.has(word)) {
      console.log(`invalid word '${word}'`);
      process.exit(1);
    }
  }
  if (words.length != 24) {
    console.log(`WARNING: only ${words.length} present`);
    process.exit(1);
  }
}


console.log(`\n\ntrying ${finalPhrases.length} final phrases:`);

const VERBOSE = false;
for (let i = 0; i < finalPhrases.length; i++) {
  //console.log(`trying phrase ${i+1}/${finalPhrases.length}... `);
  const progress = Math.floor(finalPhrases.length / 100);
  if (0 === (i+1) % (progress)) {
    console.log(`${(100 * (i+1) / finalPhrases.length).toFixed(1)}% complete`);
  }
  const p = finalPhrases[i];
  if (VERBOSE) console.log(`'${p.join(" ")}'`);

  if (bip39.validateMnemonic(p)) {
    console.log('VALID!!!');
    console.log(p);
    process.exit(0);
  }
}
console.log('\nall done!');
