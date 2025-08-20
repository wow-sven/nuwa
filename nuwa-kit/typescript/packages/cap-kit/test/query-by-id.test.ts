import { CapKit } from "../src/index";
import {describe, expect, it} from '@jest/globals';
import {setupEnv} from "./setup";

describe("CapKit", () => {
  let capKit: CapKit;
  beforeAll(async () => {
    const { capKit: a } = await setupEnv();
    capKit = a;
  })

  it("should query cap by id", async () => {
    const all = await capKit.queryWithName()

    const cap = all.data?.items[0]
    const result = await capKit.queryCapWithID(cap?.cid || '')
    const result1 = await capKit.queryCapWithID(cap?.id || '')

    console.log(result)
  }, 150000);
});
