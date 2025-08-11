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

    const result = await capKit.downloadCap(
      caps.data?.items[0].cid || ''
    )
  }, 150000);
});
