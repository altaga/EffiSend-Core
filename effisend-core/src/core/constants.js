import { Dimensions, Image, PixelRatio, Platform } from "react-native";
// Blockchain
import USDC from "../assets/logos/usdc.png";
import USDT from "../assets/logos/usdt.png";
import WETH from "../assets/logos/weth.png";
import WBTC from "../assets/logos/wbtc.png";
import WCORE from "../assets/logos/wcore.png";
import CORE from "../assets/logos/core.png";

const normalizeFontSize = (size) => {
  let { width, height } = Dimensions.get("window");
  if (Platform.OS === "web" && height / width < 1) {
    width /= 2.3179;
    height *= 0.7668;
  }
  const scale = Math.min(width / 375, height / 667); // Based on a standard screen size
  return PixelRatio.roundToNearestPixel(size * scale);
};

const w = normalizeFontSize(50);
const h = normalizeFontSize(50);

export const refreshTime = 1000 * 60 * 1;

export const USDCicon = (
  <Image source={USDC} style={{ width: 30, height: 30, borderRadius: 10 }} />
);

export const iconsBlockchain = {
  usdc: (
    <Image source={USDC} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  usdt: (
    <Image source={USDT} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  weth: (
    <Image source={WETH} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  wbtc: (
    <Image source={WBTC} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  wcore: (
    <Image source={WCORE} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  core: <Image source={CORE} style={{ width: w, height: h, borderRadius: 10 }} />,
};

export const blockchain = {
    network: "Core Blockchain",
    token: "CORE",
    chainId: 1116,
    blockExplorer: "https://scan.coredao.org/",
    rpc: [
      "https://1rpc.io/core",
      "https://core.drpc.org",
      "https://rpc-core.icecreamswap.com",
      "https://rpc.coredao.org",
    ],
    iconSymbol: "core",
    decimals: 18,
    batchBalancesAddress: "0x0dB33709a9B9056b3BeCd783BEB407B86216F6FA",
    rewardsContract: "0x04A4e03a1F879DE1F03D3bBBccd9CB9500d6A7e8",
    color: "#28A0F0",
    tokens: [
      {
        name: "CORE Token",
        color: "#ff9211",
        symbol: "CORE",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        icon: iconsBlockchain.core,
        coingecko: "coredaoorg",
      },
      {
        name: "USDC",
        color: "#2775ca",
        symbol: "USDC",
        address: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",
        decimals: 6,
        icon: iconsBlockchain.usdc,
        coingecko: "usd-coin",
      },
      {
        name: "Tether",
        color: "#008e8e",
        symbol: "USDT",
        address: "0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1",
        decimals: 6,
        icon: iconsBlockchain.usdt,
        coingecko: "tether",
      },
      {
        name: "Wrapped BTC",
        color: "#f09242",
        symbol: "WBTC",
        address: "0x5832f53d147b3d6cd4578b9cbd62425c7ea9d0bd",
        decimals: 8,
        icon: iconsBlockchain.wbtc,
        coingecko: "wrapped-bitcoin",
      },
      {
        name: "Wrapped Core",
        color: "#ff9211",
        symbol: "WCORE",
        address: "0x191e94fa59739e188dce837f7f6978d84727ad01",
        decimals: 18,
        icon: iconsBlockchain.wcore,
        coingecko: "wrapped-core",
      },
      {
        name: "Wrapped ETH",
        color: "#808080",
        symbol: "WETH",
        address: "0xeAB3aC417c4d6dF6b143346a46fEe1B847B50296",
        decimals: 18,
        icon: iconsBlockchain.weth,
        coingecko: "weth",
      },
    ],
  }
