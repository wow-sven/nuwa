import { CapKit } from "../src/index";
import { describe, it } from '@jest/globals';
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv();
    capKit = a;
  })

  it("should query cap by id", async () => {
    const cid = await capKit.registerCap(
      "test_cap",
      "test_cap",
      {}
    );

    await new Promise(resolve => setTimeout(resolve, 35000));

    const result = await capKit.queryCapWithCID(cid)

    console.log(result)
  }, 150000);
});
