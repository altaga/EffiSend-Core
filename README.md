# EffiSend-Core

<p align="center">
<img src="./Images/logo.png" width="20%">
<p>

EffiSend is a cutting-edge identity and payments platform built on **Core**. It combines AI-powered **Face-ID** biometrics with an AI-driven agent for secure, seamless identity and finance management. By tokenizing verified interactions and ecosystem participation, EffiSend bridges trust, finance, and incentives—unlocking a new era of user engagement and rewards.

## 🔗 Fast Links

  - **WEB DAPP:** [LINK](https://effisend-core.expo.app/)
  - **VIDEO DEMO:** [LINK](http://youtu.be/ZO4d3-qJgDY)

## ⚙️ System Architecture & Tech Stack

EffiSend is built from the ground up to leverage a modern Web3 infrastructure, ensuring scalability, security, and a seamless user experience.

<img src="./Images/diagram.drawio.png">

*(The system diagram illustrates how the EffiSend frontend and backend services interact with the Core network. The USDC token is shown as the primary asset for rewards and payments.)*

### Core Components:

  - [**Core**](https://www.google.com/search?q=https://coredao.org/)
    Serves as the main blockchain, powering all EffiSend transactions. Core provides unparalleled speed, low-cost transactions, and fast finality, making it the ideal foundation for a high-throughput application like EffiSend.

  - [**USDC**](https://www.circle.com/en/usdc)
    The primary token for **rewards and payments** within the EffiSend ecosystem. As a widely adopted stablecoin, USDC is deeply integrated into the community, driving user engagement.

  - [**Langchain (AI Agent)**](https://lanchain.com/)
    The framework behind our AI agent, **DeSmond**. It enables natural language processing, allowing users to execute transfers, check balances, and perform other actions through simple conversation.

  - [**DeepFace**](https://viso.ai/computer-vision/deepface/)
    Powers our **Face-ID** verification system. DeepFace provides real-time facial recognition with anti-spoofing features, ensuring that wallet access and transactions are both frictionless and highly secure.

## 🤳 FaceID

EffiSend enables seamless and secure payments through facial recognition and linking a user’s unique biometric profile directly to their wallet.

<img src="./Images/faceid1.png" width="32%"> <img src="./Images/faceid2.png" width="32%"> <img src="./Images/faceid3.png" width="32%">

The core of this feature is a two-part validation process:

1.  **`fetchOrSave`:** This function first attempts to find an existing user via facial recognition. If no match is found, it securely saves the new user's facial embedding, linking it to their new account.
2.  **`fetch`:** This function is used for subsequent logins and transaction authorizations, performing a search-only operation to retrieve user data upon a successful facial match.

This biometric system is isolated from other services to ensure maximum security.

#### User Verification Snippet

  - Fetch or Save:

<!-- end list -->

```python
@app.post("/fetchOrSave", dependencies=[Depends(check_api_key)])
async def findUser(item: ItemUserFace):
    try:
        result = DeepFace.find(
            img_path=item.image,
            db_path=DB_DIR,
            anti_spoofing=True
        )
        # Simplified result parsing
        return {"result": result[0].identity[0]}
    except Exception:
        # Save new user image
        save_image(item.image, item.nonce)
        return {"result": True}
```

  - Fetch:

<!-- end list -->

```python
@app.post("/fetch", dependencies=[Depends(check_api_key)])
async def findUser(item: ItemUserFace):
    try:
        result = DeepFace.find(
            img_path=item.image,
            db_path=DB_DIR,
            anti_spoofing=True
        )
        # Simplified result parsing
        return {"result": result[0].identity[0]}
    except Exception:
        return {"result": False}
```

## 💳 Payments:

For payments, EffiSend defaults to **USDC** to provide users with a stable and reliable way of payment. As a widely adopted stablecoin on Core, USDC enables straightforward and cost-effective transactions.

  - The merchant or user initiates a payment request. Afterward, the customer’s QR code—similar to Alipay—or facial recognition is scanned. Once verified, the system displays the available tokens, allowing the user to proceed with the payment.

    <img src="./Images/pay1.png" width="32%"> <img src="./Images/pay2.png" width="32%"> <img src="./Images/pay3.png" width="32%">

  - Once the transaction is finalized, it will be visible on the mainnet explorer along with a digital receipt. The receipt can be printed or sent via email for record-keeping.

    <img src="./Images/pay4.png" width="32%"> <img src="./Images/pay5.png" width="32%"> <img src="./Images/pay6.png" width="32%">

### Crypto Payment Main Code

```javascript
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
const result = await wallet.sendTransaction(transaction);
```

All technical implementations for this module are included here.

  - [**Fetch Account**](./core-functions/core-fetch-or-create.js)
  - [**Execute Payment**](./core-functions/core-execute.js)

## 🎁 Rewards

EffiSend’s identity-based rewards model encourages platform engagement. Users earn **USDC** tokens for completing a certain number of transactions or actions, fostering a vibrant and active community.

<img src="./Images/faceid2.png" width="32%"> <img src="./Images/faceid3.png" width="32%"> <img src="./Images/rew4.png" width="32%">

Our **Trust Score** algorithm is based on a user's on-chain activity. By analyzing an account's transaction history on Core, we can reward active and trustworthy users, which in turn unlocks better recommendations and future rewards.

### New Account Snippet.

```javascript
const wallet = Wallet.createRandom();
let dataframe = {
    privateKey: wallet.privateKey,
    address : wallet.address,
    user,
    rewards:"0.01"
}
await Accounts.doc(user).set(dataframe);
```

### Reward Snippet.

```javascript
const { rewards, user } = query.docs[0].data();
if (rewards <= 0) {
    throw "NO REWARDS"
}
const tx = await contract.transfer(_address, parseUnits(rewards, 6));
const dataFrameTemp = query.docs[0].data();
const dataframe = {
    ...dataFrameTemp,
    rewards: "0"
}
await Accounts.doc(user).set(dataframe);
```

All technical implementations for this module are included here.

  - [**Create or Fetch Account**](./core-functions/core-fetch-or-create.js)
  - [**Claim Rewards**](./core-functions/core-claim.js)

## 🤖 AI Agent (DeSmond)

The EffiSend platform features **DeSmond**, an AI agent built with **Langchain**. DeSmond understands natural language, allowing users to manage their finances conversationally.

<img src="./Images/agent1.png" width="32%"> <img src="./Images/agent2.png" width="32%"> <img src="./Images/agent3.png" width="32%">

### Agent Tools & Capabilities

DeSmond uses a graph-based workflow to conditionally execute tasks based on user intent. Its primary tools include:

  - **`transfer_tokens`**: Facilitates token transfers on the Core Mainnet.
  - **`get_balance_core`**: Retrieves a user's current token balance on Core.
  - **`list_of_tools`**: Informs the user about DeSmond's capabilities.
  - **`fallback`**: Provides a friendly, conversational response when a user's intent is unclear.

### Special Menthod:

In the case of the MetaMask Card fund, it is activated when the user requests to send USDC to a MetaMask Card.

<img src="./Images/final.drawio.png">

  - **`fund_metamask_card`**: Enables the user to fund their MetaMask card.

<!-- end list -->

```javascript
const fundMemamaskCard = tool(
  async ({ amount, to }, { configurable: { user } }) => {
    const response = await fetchURL(process.env.TOP_UP_PAYMENT_API, {
      user,
      amount,
      to,
    });
    console.log(response);
    if (response === null) {
      return JSON.stringify({
        status: "error",
        message: "Transaction failed.",
      });
    }
    const { hash } = response;
    return JSON.stringify({
      status: "success",
      message: "Transaction created and available on your MetaMask Card.",
      transaction: hash,
    });
  },
  {
    name: "fund_metamask_card",
    description:
      "This tool facilitates transfers where the specified amount is in USD, but the sending token is USDC on the Core Mainnet. It generates transaction data for the user to sign and activates when the user explicitly opts to send USD to a MetaMask Card or mentions relevant terms such as 'transfer,' 'USDC,' 'Core Mainnet,' or 'MetaMask Card' in the context of wallet activity.",
    schema: z.object({
      amount: z.string(),
      to: z.string(),
    }),
  }
);
```

### Agent Code Snippets

All technical implementations for this module are included here.

  - [**Agent Code Snippets**](./agent/index.js)
  - [**Fund MetaMask Card**](./core-functions/core-usdc-linea.js)