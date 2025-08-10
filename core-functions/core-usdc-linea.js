const functions = require('@google-cloud/functions-framework');
const Firestore = require("@google-cloud/firestore");
const {
    DynamicProvider,
    FallbackStrategy,
} = require("ethers-dynamic-provider");
const { Contract, parseUnits, Wallet, formatUnits } = require("ethers");
const {
    abi: ERC20abi,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const { convertQuoteToRoute, getQuote } = require("@lifi/sdk");
const { getQuote: getStargateQuote } = require("./stargate");

function setupProvider(rpcs) {
    return new DynamicProvider(rpcs, {
        strategy: new FallbackStrategy(),
    });
}

const rpcsCore = [
    "https://core.drpc.org",
    "https://rpc-core.icecreamswap.com",
    "https://rpc.coredao.org",
];

const rpcsArbitrum = [
    "https://arb-mainnet.g.alchemy.com/v2/xxx",
    "https://arb-pokt.nodies.app",
    "https://arbitrum-one-rpc.publicnode.com",
    "https://arbitrum.drpc.org",
];

const rpcsLinea = [
    "https://linea-mainnet.g.alchemy.com/v2/xxx",
    "https://linea-rpc.publicnode.com",
    "https://linea.drpc.org",
    "https://1rpc.io/linea",
    "https://rpc.linea.build/",
];

const providerCore = setupProvider(rpcsCore);
const providerArbitrum = setupProvider(rpcsArbitrum);
const providerLinea = setupProvider(rpcsLinea);

const USDCcore = "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9";
const USDCarb = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDClinea = "0x176211869ca2b568f2a7d4ee941e073a821ee1ff";

const contractUSDCarb = new Contract(USDCarb, ERC20abi, providerArbitrum);
const contractUSDClinea = new Contract(USDClinea, ERC20abi, providerLinea);

const db = new Firestore({
    projectId: "effisend",
    keyFilename: "credential.json",
});

const Accounts = db.collection("AccountsCore");

functions.http('helloHttp', async (req, res) => {
    try {
        const startTime = new Date().getTime();
        const user = req.body.user
        let query = await Accounts.where("user", "==", user).get();
        if (!query.empty) {
            const { amount, to: toAddress } = req.body;
            const { privateKey: privateKeyUser } = query.docs[0].data();
            const walletCore = new Wallet(
                privateKeyUser,
                providerCore
            );
            const walletArb = new Wallet(
                privateKeyUser,
                providerArbitrum
            );
            const usdcAmount = parseUnits(amount, 6);
            let routesRequestCoreArb = {
                srcChainKey: "coredao", // Core
                dstChainKey: "arbitrum", // Arbitrum
                srcToken: USDCcore, // USDC on Core
                dstToken: USDCarb, // USDC on Arbitrum
                srcAddress: walletCore.address,
                dstAddress: walletArb.address,
                srcAmount: usdcAmount,
                dstAmountMin: (usdcAmount * 95n) / 100n,
            };
            let routesCoreArb = await getStargateQuote(routesRequestCoreArb);
            const quoteRequest = {
                fromChain: 42161, // Arbitrum
                toChain: 59144, // Linea
                fromToken: USDCarb, // USDT on Arbitrum
                toToken: USDClinea, // USDC on Linea
                fromAmount: (usdcAmount * 95n) / 100n,
                fromAddress: walletArb.address,
                toAddress: toAddress, // Metamask card address,
            };
            let quote = await getQuote(quoteRequest);
            let route = convertQuoteToRoute(quote);
            routesRequestCoreArb = {
                ...routesRequestCoreArb,
                dstNativeAmount: (route.steps[0].estimate.gasCosts[0].amount * 11) / 10,
            };
            routesCoreArb = await getStargateQuote(routesRequestCoreArb);
            const transactionsCoreArb = routesCoreArb.quotes[0].steps.map(
                (step) => step.transaction
            );
            
            let startBalance = await contractUSDCarb.balanceOf(walletCore.address);
            let tx;
            for (const transaction of transactionsCoreArb) {
                tx = await walletCore.sendTransaction(transaction);
                await tx.wait();
                console.log(`https://scan.coredao.org/tx/${tx.hash}`);
            }
            let start = Date.now();
            console.log("Waiting for balance to change");
            while (true) {
                const currectBalance = await contractUSDCarb.balanceOf(walletArb.address);
                if (currectBalance > startBalance) {
                    console.log(`.`);
                    console.log(`Balance changed from ${startBalance} to ${currectBalance}`);
                    break;
                }
                process.stdout.write(".");
                if (Date.now() - start > 120000) {
                    throw new Error(
                        "Balance has not changed in 2 minutes, something went wrong"
                    );
                }
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            const transactionArbLinea = route.steps[0].transactionRequest;
            const transactionArbLineaApproval = {
                to: USDCarb,
                data: contractUSDCarb.interface.encodeFunctionData("approve", [
                    transactionArbLinea.to,
                    (usdcAmount * 95n) / 100n,
                ]),
                from: walletArb.address,
            };
            const transactionsArbLinea = [
                transactionArbLineaApproval,
                transactionArbLinea,
            ];
            startBalance = await contractUSDClinea.balanceOf(
                toAddress
            );
            for (const transaction of transactionsArbLinea) {
                tx = await walletArb.sendTransaction(transaction);
                await tx.wait();
                console.log(`https://arbiscan.io/tx/${tx.hash}`);
            }
            start = Date.now();
            console.log("Waiting for balance to change");
            while (true) {
                const currectBalance = await contractUSDClinea.balanceOf(
                    toAddress
                );
                if (currectBalance > startBalance) {
                    console.log(`.`);
                    console.log(`Balance changed from ${startBalance} to ${currectBalance}`);
                    break;
                }
                process.stdout.write(".");
                if (Date.now() - start > 120000) {
                    throw new Error(
                        "Balance has not changed in 2 minutes, something went wrong"
                    );
                }
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            const interval = new Date().getTime() - startTime;
            console.log(`Time: ${interval / 1000} seconds`);
            res.send({
                error: null,
                result: {
                    hash: tx.hash
                }
            });
        } else {
            console.log(e)
            res.send({
                error: "BAD USER",
                result: null
            });
        }
    }
    catch (e) {
        console.log(e)
        res.send({
            error: "BAD ERROR",
            result: null
        });
    }
});