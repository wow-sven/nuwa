import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv('local');
    capKit = a;
  })

  it("download cap by id", async () => {
    // const cid = await capKit.registerCap({
    //   name: "test_cap",
    //   description: "test_cap",
    //   options: {},
    //   signer,
    // });

    // await new Promise(resolve => setTimeout(resolve, 35000));

    const result = await capKit.downloadCap(
      'QmcG8y4tGQacqSMJdWUQuJvf4921psvoasfQrasMRRTC3q'
    )

    console.log(result)
  }, 150000);
});
