import { createSelfDid, TestEnv } from "@nuwa-ai/identity-kit";
import { CapKit } from "../src";
import { Secp256k1Keypair } from "@roochnetwork/rooch-sdk";

const localContractAddress = "0xeb1deb6f1190f86cd4e05a82cfa5775a8a5929da49fac3ab8f5bf23e9181e625";
const testContractAddress = "0xdc2a3eba923548660bb642b9df42936941a03e2d8bab223ae6dda6318716e742";
const testMcpUrl = "https://nuwa-production-7dab.up.railway.app/";
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
  // console.log(keypair.getSecretKey());

  const { signer } = await createSelfDid(env, {
    customScopes: [`${contractAddress}::*::*`],
    secretKey: 'roochsecretkey1qxff6t07ursnamzc2dmzdxccfvr9l33y09uz4a6zj8rwspcxdzzev7k83t5'
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