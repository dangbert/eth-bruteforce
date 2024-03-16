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
    console.log("cur.length: ", cur.length, ", queue.length: ", queue.length);

    let isSimple = true;
    const prefix = [];
    for (let k = 0; k < cur.length; k++) {
      console.log("\n\nk = ", k);
      const w = cur[k];
      const suffix = cur.slice(k+1);

      // handle possible comma separated options for this particular word
      const subwords = w.split(",");
      console.log("subwords: ", subwords);

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
          console.log("pushing candidate: ", candidate);
        }
      }
      if (!isSimple) break;

      prefix.push(subwords[0]);
    }
    console.log("finished iterating cur, isSimple=", isSimple);

    if (isSimple) {
      finalPhrases.push(cur);
      console.log(`${finalPhrases.length} finalPhrases`);
      //process.exit(12);
    }
    //process.exit(13);
  }
}

// final sanity check
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
for (let i = 0; i < finalPhrases.length; i++) {
  console.log(`trying phrase ${i}... `);
  const p = finalPhrases[i];
  console.log(p.join(" "));
  if (bip39.validateMnemonic(p)) {
    console.log('VALID!!!');
    console.log(p);
    process.exit(0);
  }
}
console.log('\nall done!');
