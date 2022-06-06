import "./App.css";
import { ConnectButton, Modal } from "web3uikit";
import logo from "./images/Moralis.png";
import { useState, useEffect } from "react";
import Coin from "./components/Coin";
import { abouts } from "./about";
// this is the useMoralis hook from react-moralis
import { useMoralisWeb3Api, useMoralis } from "react-moralis";

function App() {
  // btc im thinking will be the state that holds the api call that fetches data from
  // the smart contract making the value dynamic because it should be based on votes
  const [btc, setBtc] = useState(80);
  const [eth, setEth] = useState(30);
  const [sol, setSol] = useState(40);

  const [modalPrice, setModalPrice] = useState();
  const Web3Api = useMoralisWeb3Api();
  const { Moralis, isInitialized } = useMoralis();
  console.log(isInitialized);
  // console.log(Web3Api);
  const [visible, setVisible] = useState(false);
  // create a useEffect for everytime the modalToken changes
  // for a different token and get our price for that token

  const [modalToken, setModalToken] = useState();
  // button that changes modal token and set the visibility
  // create async function that fetches token price using Web3Api api

  const getRatio = async (tick, setPerc) => {
    const Votes = Moralis.Object.extend("Votes");
    const query = new Moralis.Query(Votes);

    query.equalTo("ticker", tick);
    query.descending("createdAt");
    const results = await query.first();
    console.log(results);
    let up = Number(results?.attributes.up);
    let down = Number(results?.attributes.down);
    let ratio = Math.round((up / (up + down)) * 100);
    setPerc(ratio);
  };

  useEffect(() => {
    if (isInitialized) {
      getRatio("BTC", setBtc);
      getRatio("ETH", setEth);
      getRatio("SOL", setSol);
    }

    // constant live queries to see if anyone is makeing
    // votes on smart contract
    const createLiveQuery = async () => {
      let query = new Moralis.Query("Votes");
      let subscription = await query.subscribe();
      subscription.on("update", (object) => {
        if (object.attributes.ticker === "SOL") {
          getRatio("SOL", setSol);
        } else if (object.attributes.ticker === "ETH") {
          getRatio("ETH", setEth);
        } else if (object.attributes.ticker === "BTC") {
          getRatio("BTC", setBtc);
        }
      });
    };

    createLiveQuery();
  }, [isInitialized]);

  useEffect(() => {
    const fetchTokenPrice = async () => {
      const options = {
        address:
          abouts[abouts.findIndex((x) => x.token === modalToken)].address,
      };
      const price = await Web3Api?.token?.getTokenPrice(options);
      // console.log(price)
      // toFixed method gives the desired decimal places amount. for example
      // toFixed(3) would give 12.123 if it was toFixed(2) it would be 12.12
      setModalPrice(price.usdPrice.toFixed(3));
    };
    if (modalToken) {
      fetchTokenPrice();
    }
  }, [modalToken]);

  return (
    <>
      <div className="header">
        <div className="logo">
          <img src={logo} alt="logo" height="50px" />
          Sentiment
        </div>
        <ConnectButton />
      </div>
      <div className="instructions">
        Where do you think these tokens are going? Up or Down?
      </div>
      <div className="list">
        {/* create components for coin bubbles, passing the state btc and setBtc function as props */}
        <Coin
          perc={btc}
          setPerc={setBtc}
          token={"BTC"}
          setModalToken={setModalToken}
          setVisible={setVisible}
        />
        <Coin
          perc={eth}
          setPerc={setEth}
          token={"ETH"}
          setModalToken={setModalToken}
          setVisible={setVisible}
        />
        <Coin
          perc={sol}
          setPerc={setSol}
          token={"SOL"}
          setModalToken={setModalToken}
          setVisible={setVisible}
        />
      </div>

      <Modal
        isVisible={visible}
        onCloseButtonPressed={() => setVisible(false)}
        hasFooter={false}
        title={modalToken}
      >
        <div>
          <span style={{ color: "#fff" }}>{`Price : `}</span>${modalPrice}
        </div>

        <div>
          <span style={{ color: "white" }}>{`About`}</span>
        </div>
        <div>
          {modalToken &&
            abouts[abouts.findIndex((x) => x.token === modalToken)].about}
        </div>
      </Modal>
    </>
  );
}

export default App;
