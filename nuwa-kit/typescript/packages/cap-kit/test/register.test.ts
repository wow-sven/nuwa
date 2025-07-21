import { CapKit } from "../src/index";
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TestEnv, createSelfDid } from "@nuwa-ai/identity-kit";

// 注册地址 https://nuwa-production-a276.up.railway.app/
// 合约地址 0xdc2a3eba923548660bb642b9df42936941a03e2d8bab223ae6dda6318716e742
// 测试环境 https://testnet.rooch.network/

describe("CapKit", () => {
  it("should register a cap", async () => {
    const env = await TestEnv.bootstrap({
      rpcUrl: process.env.ROOCH_NODE_URL || 'http://localhost:6767',
      network: 'test',
      debug: true,
    });
    
    const { signer } = await createSelfDid(env);

    const capKit = new CapKit({
      roochUrl: "http://localhost:6767",//https://testnet.rooch.network/",
      mcpUrl: "http://localhost:3000/mcp",
      contractAddress: "0xdc2a3eba923548660bb642b9df42936941a03e2d8bab223ae6dda6318716e742",
    });

    const result = await capKit.registerCap({
      name: "test_cap",
      description: "test_cap",
      options: {},
      signer,
    });

    console.log(result)
  });
});
