import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";

function App() {
  //contract address is the first one
  // bankContract deployed to: 0xd48988b1a6943aFDa005245512f6e5f60297A45C
  // bankContract owner address: 0xd427b183935D6Be800cE79C9B9CD6190e17f0c00

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({
    withdraw: "",
    deposit: "",
    bankName: "",
  });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = "0xd48988b1a6943aFDa005245512f6e5f60297A45C";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      //your code here
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account connected: ", account);
      } else {
        setError("Please install a Metamask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankName = async () => {
    try {
      //your code here
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setBankNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await bankContract.setBankName(
          utils.formatBytes32String(inputValue.bankName)
        );
        console.log("Setting Bank Name...");
        await txn.wait();
        console.log("Bank Name Changed", txn.hash);
        await getBankName();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getbankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        //call our contract to get the address of the bank owner (that wass stored as a public variable)
        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);
        //check if the current MetaMask Wallet address matches the address that deployed and owns the contract
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        //If that is the case, we use setIsBankerOwner to set our bank owner flag to true and show the special admin panel.
        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
      //your code here
    } catch (error) {
      console.log(error);
    }
  };

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let balance = await bankContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  const deposityMoneyHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        });
        console.log("Depositing money...");
        await txn.wait();
        console.log("Depositing money...done", txn.hash);
        //After the transaction is completed we call our customerBalanceHandler() to update the balance of our account.
        customerBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withDrawMoneyHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let myAdress = await signer.getAddress();
        console.log("provider signer...", myAdress);
        const txn = await bankContract.withdrawMoney(
          myAdress,
          ethers.utils.parseEther(inputValue.withdraw)
        );
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Withdrawing money...done", txn.hash);
        customerBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getbankOwnerHandler();
    customerBalanceHandler();
  }, [isWalletConnected]);

  return (
    <main className="main-container">
      <h2 className="headline">
        <span className="headline-gradient">Bank Contract Project</span> 💰
      </h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentBankName === "" && isBankerOwner ? (
            <p>"Setup the name of your bank." </p>
          ) : (
            <p className="text-3xl font-bold">{currentBankName}</p>
          )}
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button className="btn-purple" onClick={deposityMoneyHandler}>
              Deposit Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button className="btn-purple" onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Customer Balance: </span>
            {customerTotalBalance}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Bank Owner Address: </span>
            {bankOwnerAddress}
          </p>
        </div>
        <div className="mt-5">
          {isWalletConnected && (
            <p>
              <span className="font-bold">Your Wallet Address: </span>
              {customerAddress}
            </p>
          )}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {isBankerOwner && (
        <section className="bank-owner-section">
          <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">
            Bank Admin Panel
          </h2>
          <div className="p-10">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="bankName"
                placeholder="Enter a Name for Your Bank"
                value={inputValue.bankName}
              />
              <button className="btn-grey" onClick={setBankNameHandler}>
                Set Bank Name
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
export default App;
