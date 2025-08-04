import { createSelfDid, TestEnv } from "@nuwa-ai/identity-kit";
import { CapKit } from "../src";
import { Secp256k1Keypair } from "@roochnetwork/rooch-sdk";

const localContractAddress = "0xeb1deb6f1190f86cd4e05a82cfa5775a8a5929da49fac3ab8f5bf23e9181e625";
const testContractAddress = "0xdc2a3eba923548660bb642b9df42936941a03e2d8bab223ae6dda6318716e742";
const testMcpUrl = "https://nuwa-production-285f.up.railway.app/mcp";
const localMcpUrl = "http://localhost:3000/mcp";

export const setupEnv = async (target: 'test' | 'local') => {
  const roochUrl = process.env.ROOCH_NODE_URL || target === 'test' ? 'https://test-seed.rooch.network' : 'http://localhost:6767';
  const mcpUrl = process.env.MCP_URL || target === 'test' ? testMcpUrl : localMcpUrl;
  const contractAddress = process.env.CONTRACT_ADDRESS || target === 'test' ? testContractAddress : localContractAddress;
  const env = await TestEnv.bootstrap({
    rpcUrl:  roochUrl,
    network: target,
    debug: false,
  });
  // const keypair = Secp256k1Keypair.generate();
  // const ad = keypair.getRoochAddress()
  // console.log(keypair.getRoochAddress())
  // console.log(keypair.getSecretKey());

  //rooch1sh6fzswzkchg8nvl8dzy3x4864svpazz27cj2femvc6u5xevfwhse864zt
  const { signer } = await createSelfDid(env, {
    customScopes: [`${contractAddress}::*::*`],
    secretKey: 'roochsecretkey1qxpraucff9az33taam876cny6rfqj2r65vtzgqqehpk8rs9mm9vn7th4eem'
  });

  const capKit = new CapKit({
    roochUrl: roochUrl,
    mcpUrl: mcpUrl,
    contractAddress: contractAddress,
    signer,
  });
  
  return {
    env,
    signer,
    capKit,
  };
};