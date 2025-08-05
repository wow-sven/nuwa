import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv();
    capKit = a;
  })

  it("download cap by id", async () => {
    const cid = await capKit.registerCap(
      "test_cap",
      "test_cap",
      {}
    );

    await new Promise(resolve => setTimeout(resolve, 35000));

    const result = await capKit.downloadCap(
      cid
    )

    console.log(result)
  }, 150000);
});
