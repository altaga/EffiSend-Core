const functions = require('@google-cloud/functions-framework');
const { Wallet, Contract } = require("ethers");
const { DynamicProvider, FallbackStrategy } = require("ethers-dynamic-provider");
const { abi } = require("./distribution.js")

const rpcs = [
    "https://arbitrum-sepolia-rpc.publicnode.com",
    "https://sepolia-rollup.arbitrum.io/rpc",
    "https://arbitrum-sepolia.public.blastapi.io",
    "https://arbitrum-sepolia.drpc.org/",
]

const provider = new DynamicProvider(rpcs, {
    strategy: new FallbackStrategy(),
});
const wallet = new Wallet("0x0000000000000000000000000000000000000000000000000000000000000000", provider);

const contract = new Contract("0x04A4e03a1F879DE1F03D3bBBccd9CB9500d6A7e8", abi, wallet)

functions.http('helloHttp', async (req, res) => {
      try {
        const tx = await contract.distributeReward(req.body.address);
        res.send({
            error: null,
            result: tx.hash
        });
    }
    catch (e) {
        console.log(e)
        res.send({
            error: "BAD REQUEST",
            result: null
        });
    }
});
