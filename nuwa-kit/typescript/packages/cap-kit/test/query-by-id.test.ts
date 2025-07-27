import { CapKit } from "../src/index";
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TestEnv, createSelfDid } from "@nuwa-ai/identity-kit";
import {setupEnv} from "./setup";
import {SignerInterface} from "@nuwa-ai/identity-kit/src";

describe("CapKit", () => {
  let capKit: CapKit;
  let signer: SignerInterface;
  beforeAll(async () => {
    const { capKit: a, signer: b } = await setupEnv('local');
    capKit = a;
    signer = b;
  })

  it("should query cap by id", async () => {
    const cid = await capKit.registerCap({
      name: "test_cap",
      description: "test_cap",
      options: {},
      signer,
    });

    const resultAll = await capKit.queryCap(signer)

    console.log(resultAll)

    const result = await capKit.queryCap(signer, {
      id: cid
    })

    console.log(result)
  });
});
