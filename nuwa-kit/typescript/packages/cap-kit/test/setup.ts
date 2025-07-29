import { createSelfDid, TestEnv } from "@nuwa-ai/identity-kit";
import { CapKit } from "../src";

const localContractAddress = "0xeb1deb6f1190f86cd4e05a82cfa5775a8a5929da49fac3ab8f5bf23e9181e625";
const testContractAddress = "0xdc2a3eba923548660bb642b9df42936941a03e2d8bab223ae6dda6318716e742";

export const setupEnv = async (target: 'test' | 'local') => {

  const env = await TestEnv.bootstrap({
    rpcUrl: process.env.ROOCH_NODE_URL || target === 'test' ? 'https://test-seed.rooch.network' : 'http://localhost:6767',
    network: target,
    debug: false,
  });

  const contractAddress = target === 'test' ? testContractAddress : localContractAddress;
  
  const { signer } = await createSelfDid(env, {
    customScopes: [`${target === 'test' ? testContractAddress : localContractAddress}::*::*`]
  });

  const capKit = new CapKit({
    roochUrl: target === 'test' ? 'https://test-seed.rooch.network' : 'http://localhost:6767',
    mcpUrl: target === 'test' ? 'https://nuwa-production-a276.up.railway.app' : 'http://localhost:3000/mcp',
    contractAddress: contractAddress,
    signer,
  });
  
  return {
    env,
    signer,
    capKit,
  };
};