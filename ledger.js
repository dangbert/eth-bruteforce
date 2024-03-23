#!/usr/bin/env node
const bip39 = require('bip39');
const fs = require('fs');
const hdkey = require('ethereumjs-wallet/hdkey');
const cliProgress = require('cli-progress');

/**
 * Given a list of seed phrases (containing possible patterns like wildcards)
 * and a list of all possible bip39 words
 * return a list of the expanded set of seed phrases (after pattern expansion).
 */
function expandPatterns(phrases, WORDS) {
  const finalPhrases = [];
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];

    if (p[0] === '#') continue; // skip commented lines

    // validate all words in phrase
    const words = p.split(' ');
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
        const suffix = cur.slice(k + 1);

        // handle possible comma separated options for this particular word
        let subwords = w.split(',');

        // wildcard
        if (w === '*') {
          subwords = Array.from(WORDS);
        }

        if (subwords.length > 1) isSimple = false;
        for (const t of subwords) {
          if (!WORDS.has(t)) {
            console.log(`invalid word '${t}'`);
            process.exit(1);
          }
          const candidate = prefix.concat([t]).concat(suffix);
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

  // remove duplicates
  return Array.from(new Set(finalPhrases));
}

/**
 * Peform sanity check that list of seed phrases are all possible.
 */
function preValidate(finalPhrases, WORDS) {
  const pbar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  pbar.start(finalPhrases.length, 0);

  for (let i = 0; i < finalPhrases.length; i++) {
    pbar.update(i);
    const words = finalPhrases[i];
    for (const word of words) {
      if (!WORDS.has(word)) {
        console.log(`invalid word '${word}'`);
        process.exit(1);
      }
    }
    // this could be changed to support shorter seed phrases
    if (words.length != 24) {
      console.log(`WARNING: only ${words.length} present`);
      process.exit(1);
    }
  }
  pbar.stop();
}

/**
 * Return Set of all valid bip39 (English) words.
 */
function readBip39Set() {
  const fname = './bip39_english.txt';
  console.log(`reading dictionary file "${fname}"`);
  let words = fs.readFileSync(fname).toString().split('\n');
  return new Set(words);
}

/**
 * Given a (valid) seed phrase, derive and return the corresponding first Ethereum address.
 * Useful if you know the Eth address associated with your ledger
 * (checking you've found the right seed phrase).
 */
function deriveFirstEthAddr(phrase) {
  // derive seed buffer
  const seed = bip39.mnemonicToSeedSync(phrase);

  // derive HD wallet
  const hdWallet = hdkey.fromMasterSeed(seed);

  // derive Ethereum addresss
  const addrIndex = 0; // 1st eth address
  const wallet = hdWallet.derivePath(`m/44'/60'/0'0/${addrIndex}`).getWallet();
  const address = wallet.getAddressString();
  const publicKey = wallet.getPublicKeyString(); // distinct from wallet's address
  return address;
}

// now we finally run the script
(async () => {
  const fname = process.argv.slice(2, 3).toString();
  //const VERBOSE = process.argv.slice(3, 4).toString() === "-v";
  const needle = process.argv.slice(3, 4).toString(); // (optional) known (1st) eth address of seed phrase
  console.log(`needle='${needle}'`);

  const WORDS = readBip39Set();

  // read list of phrases to try
  console.log(`reading mneomonic file "${fname}"`);
  let phrases = fs.readFileSync(fname).toString().split('\n');
  phrases = phrases.filter((p) => p); // remove any empty lines ("")
  phrases = [...phrases]; // ensure array

  console.log(`read ${phrases.length} lines (expanding possible patterns)...`);
  const finalPhrases = expandPatterns(phrases, WORDS);

  // final sanity check
  console.log(
    `\n\nsanity check to validate ${finalPhrases.length} final phrases...`
  );
  preValidate(finalPhrases, WORDS);

  console.log(`\n\ntrying ${finalPhrases.length} final phrases...`);
  const pbar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  pbar.start(finalPhrases.length, 0);

  // store list of possiblePhrases
  let validPhrases = [];
  for (let i = 0; i < finalPhrases.length; i++) {
    pbar.update(i);
    const p = finalPhrases[i].join(' ');

    if (bip39.validateMnemonic(p)) {
      //console.log('VALID!!! ', p);
      validPhrases.push(p);
      //process.exit(0);
    }
  }
  // make validPhrases unique
  validPhrases = Array.from(new Set(validPhrases));
  pbar.stop();
  console.log(
    `\n\ncheck complete! ${validPhrases.length}/${finalPhrases.length} tried phrases are valid.`
  );
  if (validPhrases.length === 0) process.exit(0);

  console.log(`summary:\n\nmatch #, first Eth public key, seed phrase`);
  for (let i = 0; i < validPhrases.length; i++) {
    const phrase = validPhrases[i];
    const ethPub = deriveFirstEthAddr(phrase);
    let special = '';
    if (needle !== '') {
      if (!ethPub.toLowerCase().startsWith(needle.toLowerCase())) continue;
      special = '===========>';
    }
    console.log(`${special}${i + 1}, ${ethPub}, ${phrase}`);
  }
})();
