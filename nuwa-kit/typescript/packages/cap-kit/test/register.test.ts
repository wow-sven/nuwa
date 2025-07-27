import { CapKit } from "../src/index";
import { jest, describe, it} from '@jest/globals';
import { SignerInterface } from "@nuwa-ai/identity-kit";
import { setupEnv } from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  let signer: SignerInterface;
  beforeAll(async () => {
    const { capKit: a, signer: b } = await setupEnv('local');
    capKit = a;
    signer = b;
  })

  it("should register a cap", async () => {
    const result = await capKit.registerCap({
      name: "test_cap",
      description: "test_cap",
      options: {},
      signer,
    });

    console.log(result)
  });
});
