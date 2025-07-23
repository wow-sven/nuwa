import { CapKit } from "../src/index";
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TestEnv, createSelfDid } from "@nuwa-ai/identity-kit";

describe("CapKit", () => {
  it("should query cap by id", async () => {
    const env = await TestEnv.bootstrap({
      rpcUrl: process.env.ROOCH_NODE_URL || 'http://localhost:6767',
      network: 'test',
      debug: true,
    });
    
    const { signer } = await createSelfDid(env, {
      customScopes: ["0xeb1deb6f1190f86cd4e05a82cfa5775a8a5929da49fac3ab8f5bf23e9181e625::*::*"]
    });

    const capKit = new CapKit({
      roochUrl: "http://localhost:6767",//https://testnet.rooch.network/",
      mcpUrl: "http://localhost:3000/mcp",
      contractAddress: "0xeb1deb6f1190f86cd4e05a82cfa5775a8a5929da49fac3ab8f5bf23e9181e625",
    });

    const cid = await capKit.registerCap({
      name: "test_cap",
      description: "test_cap",
      options: {},
      signer,
    });

    const result = await capKit.queryCap(signer, {
      id: cid
    })

    console.log(result)
  });
});
