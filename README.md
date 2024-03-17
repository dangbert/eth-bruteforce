Brute force the password to your Ethereum wallet by testing a provided list of possible passwords.

Also supports doing the same for the seed phrase to a Ledger device (or any other Bip39 mneomonic).

## Usage

````bash
# install dependencies
yarn install


# brute force an Ether wallet given a list of possible passwords:
node eth.js /path/to/keystorefile /path/to/pwList.txt
# for example:
node eth.js examples/UTC--2018-04-29T10-08-25.072Z--1f7c98090febf46155496a370002a10af7eb6766 examples/eth.txt


# brute force a bip39 mneomonic phrase (e.g. for a ledger) given list of possible phrases:
node ledger.js examples/ledger.txt

# if you know the first Ethereum address derived from your seed phrase
#   you can optionally provide it to make the correct seed phrase more clear in the output:
node ledger.js examples/ledger.txt 0xf6a13a0cb183240e528847b4bb32750d9c402f5e
````

Run tests (auto runs the two examples above):

````bash
yarn test
````
