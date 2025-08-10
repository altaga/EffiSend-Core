const functions = require('@google-cloud/functions-framework');
const Firestore = require("@google-cloud/firestore");
const {
  abi: abiERC20,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const { DynamicProvider, FallbackStrategy } = require("ethers-dynamic-provider");
const { parseEther, parseUnits, Interface, Wallet } = require("ethers")

const db = new Firestore({
  projectId: "effisend",
  keyFilename: "credential.json",
});

const Accounts = db.collection("AccountsCore");

const rpcs = [
  "https://1rpc.io/core",
  "https://core.drpc.org",
  "https://rpc-core.icecreamswap.com",
  "https://rpc.coredao.org",
]

const provider = new DynamicProvider(rpcs, {
  strategy: new FallbackStrategy(),
});

const tokens = [
  {
    name: "CORE Token",
    color: "#ff9211",
    symbol: "CORE",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    coingecko: "coredaoorg",
  },
  {
    name: "USDC",
    color: "#2775ca",
    symbol: "USDC",
    address: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",
    decimals: 6,
    coingecko: "usd-coin",
  },
  {
    name: "Tether",
    color: "#008e8e",
    symbol: "USDT",
    address: "0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1",
    decimals: 6,
    coingecko: "tether",
  },
  {
    name: "Wrapped BTC",
    color: "#f09242",
    symbol: "WBTC",
    address: "0x5832f53d147b3d6cd4578b9cbd62425c7ea9d0bd",
    decimals: 8,
    coingecko: "wrapped-bitcoin",
  },
  {
    name: "Wrapped Core",
    color: "#ff9211",
    symbol: "WCORE",
    address: "0x191e94fa59739e188dce837f7f6978d84727ad01",
    decimals: 18,
    coingecko: "wrapped-core",
  },
  {
    name: "Wrapped ETH",
    color: "#808080",
    symbol: "WETH",
    address: "0xeAB3aC417c4d6dF6b143346a46fEe1B847B50296",
    decimals: 18,
    coingecko: "weth",
  },
]

functions.http('helloHttp', async (req, res) => {
  try {
    let query = await Accounts.where("user", "==", req.body.user).get();
    if (query.empty) {
      throw "BAD USER"
    }
    const { privateKey } = query.docs[0].data();
    const wallet = new Wallet(privateKey, provider);
    let transaction;
    if (req.body.token === 0) {
      transaction = {
        to: req.body.destination,
        value: parseEther(req.body.amount)
      }
    } else {
      const interface = new Interface(abiERC20);
      const data = interface.encodeFunctionData("transfer", [
        req.body.destination,
        parseUnits(
          req.body.amount,
          tokens[req.body.token].decimals
        ),
      ]);
      transaction = {
        to: tokens[req.body.token].address,
        data
      }
    }
    const result = await wallet.sendTransaction(transaction)
    res.send({
      error: null,
      result: result.hash,
    });
  }
  catch (e) {
    console.log(e);
    res.send({
      error: "Bad Request",
      result: null,
    });
  }
});
