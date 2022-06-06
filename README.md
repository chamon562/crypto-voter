# myFirstDapp Tutorial credits to Moralis.io
- This tutorial was done from their youtube : [https://www.youtube.com/watch?v=MI_Se26Sfmo&t=3437s](url)

## Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

# Things you need

- api key from polygon click add+ a new one
- moralis.io get the node endpoint
  - click speedy nodes and click polygon since we have a polygon api key
  - copy the mumbai url and this is the endpoint we need to talk to the networkhttps://speedy-nodes-nyc.moralis.io/3df6b513ba8b32d3320fb51e/polygon/mumbai
- get private key from metamask. dont share with anyone or let anyone see that key.

# Issue one

- when doing command:
  - npx hardhat clean this error pops up:
- Error HH8: There's one or more errors in your config file:

  - Invalid account: #0 for network: mumbai - Expected string, received undefined

To learn more about Hardhat's configuration, please go to https://hardhat.org/config/

- getting error hh8 to fix found solution here [https://stackoverflow.com/questions/71543451/h88-error-invalid-account-0-for-network-mumbai-expected-string-received-u](url)
- mumbai: {
  url: "https://rpc-mumbai.matic.today",
  accounts: process.env.pk
  Incorrect:

mumbai: {
url: "https://rpc-mumbai.matic.today",
accounts: [process.env.pk] <-- remove the array

- ALERT had to redo the array around the private key and take it out.
- i miss spelled private key. and another error was insufficent funds so when t this
  - The problem on my side was the address was indeed without funds. Go to this address to request funds from the faucet https://fauceth.komputing.org/ and enter your wallet address from metamask. if you have the browser extension you can find your correct address right there, see the following image:
- request some test money to run the script

## IF yarn is not installed

- found here: [https://stackoverflow.com/questions/69558524/change-yarn-to-npm-when-using-npx-install-react-create-app](url)
- try delete yarn.lock and run npm install and it will generate a package-lock.json

## Frontend React app

- to make page interact we have to initialize moralis
- go back to moralis.io dashboard and +create new server
- create testnet server
- can name it whatever. in this tutorial will call it my-first-dapp
- select clost region, i chose new york
- then select polygon mumbai
- click view details on the server just created and go back to index.js to place in the appid and the server url

## last thing is to connect Dapp to smart contract using Moralis

- First to sync event that happens on the smart contracts
- Store them in our Moralis database
- and then get current votes to our app calculate the ratio of votes up and down and present them in the bubble
- To get Started go to Moralis.io dashboard
  - in your my-first-dapp server that you created click view Details and go to sync events tab on the top right.
  - create a new sync event to sync all the events thats our smart contract emitts and new votes being made on the smart contract. click Add New Sync
  - click on the Sync and watch Contract Events tab
  - click on the test net were on which is Polygon Mumbai
  - in the Description type New Vote
  - make sure Sync_historical options is checked as well. Because we manually made some votes earlier.
  - Topic will be the event name with all the variable types that it emits, so go to our contract on polygon scan or if cant find go to smart contracts in contracts look for :
    ```js
        event tickerupdated(uint256 up, uint256 down, address voter, string ticker);
    ```
  - and copy just event names and variable types
  - event name is tickerupdated and variabletypes are uint256, uint256, address, string tickerupdated(uint256 up, uint256 down, address voter, string ticker) keys without the values
  - then for Abi (application binary interface)
    - This is also presented to us on polygon scan for verified contracts and copy the object that starts at anonymous up to "type": "event"
  - FYI if get lost go mumbai.polygonscan.com and paste in the address of your metamask wallet and in the contracts tab under the Home blockchain tokens misc tab youll see and be able to get the Contract ABI
- ATTENTION run a smart contract: npx hardhat run scripts/deploy... --network mumbai
- then verify npx hardhat verify 120938u0213 the address
- then the address generated in the terminal ctrl left click it and itll show the contract overview and that will help with getting back to the write contract to vote
  ```json
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "relay", "type": "address" },
      { "indexed": false, "name": "stake", "type": "uint256" },
      { "indexed": false, "name": "unstakeDelay", "type": "uint256" }
    ],
    "name": "Staked",
    "type": "event"
  }
  ```
  - get the contract address way at the top
  - no filter
  - and give it a table name called Votes and click confirm
- and now our Moralis server is syncing anythiing that has happened on the blockchain into our database and it constantly keeps looking at our smart contract to see if any new events happened and then will updated our databse accordingly
- to check out database go close the server window that was just created.
- click the drop down arrow on right
  and click dashboard on the bottom

## Using REact to pull data from Moralis.io

```js
// import useMoralis hook from react-moralis
 import { useMoralisWeb3Api, useMoralis } from "react-moralis";
  const App = () =>{
    // make sure that Moralis provider initializes Moralis before we use any of this functionality
    const { Moralis, isInitialized } = useMoralis();

    // create a function to get a ratio of votes for any token weve requested
    const getRatio = async (tick, setPerc) => {
    const Votes = Moralis.Object.extend("Votes");
    const query = new Moralis.Query(Votes);
    console.log(query.equalTo("ticker", tick))
    // make sure ticker is equal to the tick when calling the getRatio funciton
    query.equalTo("ticker", tick);
    // set the order of the query createdAt in descending order
    // this helps with getting the first element so the most recent created vote
    query.descending("createdAt");
    // we can get the number of up and downs by looking at results object attribute
    const results = await query.first();
    console.log(results)
    // and getting the up key
    let up = Number(results.attributes.up);
    // and getting the down key and turning them into numbers
    let down = Number(results.attributes.down);
    // calculating the ratio by calculating the number of votes up divided that by the total number of votes
    //  multiplied by 100 and round it to a whole number
    let ratio = Math.round((up / (up + down)) * 100);
    setPerc(ratio);
  };
  // create a useEffect that is triggered everytime Moralis is initialized
  // to get from our moralis database the current number of votes
  useEffect(() => {
    if (isInitialized) {
      getRatio("BTC", setBtc);
      getRatio("ETH", setEth);
      getRatio("SOL", setSol);
    }
    // everytime isInitialized changes, when the app first runs we check if
    // isInitialized we have the initialized state and then we get the ratio
  }, [isInitialized]);
  }

```
