import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import { SignerInterface } from "@nuwa-ai/identity-kit";
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  let signer: SignerInterface;
  beforeAll(async () => {
    const { capKit: a, signer: b } = await setupEnv('local');
    capKit = a;
    signer = b;
  })

  it("download cap by id", async () => {
    const cid = await capKit.registerCap({
      name: "test_cap",
      description: "test_cap",
      options: {},
      signer,
    });

    const result = await capKit.downloadCap(signer, {
      id: cid
    })

    console.log(result)
  });
});
