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
    const caps = await capKit.queryWithName()

    const result = await capKit.downloadCapWithCID(
      caps.data?.items[0].cid || ''
    )

    const result1 = await capKit.downloadCapWithID(
      caps.data?.items[0].id || ''
    )

    console.log(result1)
    console.log(result)
  }, 150000);
});
